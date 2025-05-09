import { PrismaClient } from "@prisma/client";
import { createNamespace, Namespace } from 'cls-hooked';

// Create a namespace for storing tenantId
export const NAMESPACE_NAME = 'tenant-context';

export const namespace = createNamespace(NAMESPACE_NAME);

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['query', 'error']
    });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db: ReturnType<typeof prismaClientSingleton> =
    globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;

// Function to set tenant ID for the current execution context
export function setTenantId(tenantId: string) {
    if (!namespace.active) {
        console.log('Warning: Attempting to set tenantId outside active namespace');
        return;
    }

    namespace.set('tenantId', tenantId);
    console.log(`Set tenant ID in CLS: ${tenantId}`);
}

// Function to get current tenant ID from namespace
export function getCurrentTenantId(): string | undefined {
    if (!namespace.active) {
        console.log('Warning: Attempting to get tenantId outside active namespace');
        return undefined;
    }

    const tenantId = namespace.get('tenantId');
    // Only log undefined tenant IDs in debug mode or during troubleshooting
    if (tenantId === undefined) {
        if (process.env.DEBUG_TENANT === 'true') {
            console.log('Getting tenant ID from CLS: undefined (expected during auth or before tenant attachment)');
        }
    } else {
        console.log(`Getting tenant ID from CLS: ${tenantId}`);
    }
    return tenantId;
}

// Models that don't have tenant isolation
const NON_TENANT_MODELS = ['tenant'];

// Middleware to automatically add tenantId to queries
db.$use(async (params, next) => {
    const tenantId = getCurrentTenantId();

    // Skip for models without tenant or specific operations
    if (
        !tenantId ||
        NON_TENANT_MODELS.includes(params.model || '') ||
        params.action === 'findUnique' ||
        (params.action === 'findFirst' && params.args?.where?.id)
    ) {
        // For select cases, we want to log why we're skipping tenant filtering
        if (process.env.DEBUG_TENANT === 'true') {
            if (!tenantId) {
                console.log(`Skipping tenant filtering for ${params.model}.${params.action}: No tenant ID available`);
            } else if (NON_TENANT_MODELS.includes(params.model || '')) {
                console.log(`Skipping tenant filtering for ${params.model}.${params.action}: Model exempt from tenant isolation`);
            }
        }
        return next(params);
    }

    // For queries (reads)
    if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'count') {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};

        // Add tenantId to where clause
        params.args.where.tenantId = tenantId;

        // Log the modified query for debugging
        console.log(`Modified ${params.model}.${params.action} query with tenantId: ${tenantId}`);
    }

    // For mutations (writes)
    if (['create', 'createMany', 'update', 'updateMany'].includes(params.action)) {
        if (!params.args) params.args = {};

        // Add tenantId to data for create operations
        if (params.action === 'create' || params.action === 'createMany') {
            if (!params.args.data) params.args.data = {};

            // For arrays (createMany)
            if (Array.isArray(params.args.data)) {
                params.args.data = params.args.data.map((item: any) => ({
                    ...item,
                    tenantId: tenantId
                }));
            } else {
                // For single objects (create)
                params.args.data.tenantId = tenantId;
            }

            console.log(`Added tenantId to ${params.model}.${params.action} data`);
        }

        // For update operations, make sure we're only updating records from current tenant
        if (params.action === 'update' || params.action === 'updateMany') {
            if (!params.args.where) params.args.where = {};
            params.args.where.tenantId = tenantId;

            console.log(`Added tenantId filter to ${params.model}.${params.action} where clause`);
        }
    }

    // For delete operations, ensure we only delete from current tenant
    if (['delete', 'deleteMany'].includes(params.action)) {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        params.args.where.tenantId = tenantId;

        console.log(`Added tenantId filter to ${params.model}.${params.action} where clause`);
    }

    return next(params);
});