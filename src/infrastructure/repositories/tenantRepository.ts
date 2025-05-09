import { PrismaClient, tenant as PrismaTenant, Prisma } from "@prisma/client";
import { Tenant } from "../../domain/entities/tenant";
import { ITenantRepository } from "./ITenantRepository";
import db from "../database/prisma";

export class TenantRepository implements ITenantRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = db;
    }

    async findAll(): Promise<Tenant[]> {
        const tenats = await this.prisma.tenant.findMany();
        return tenats.map(this.mapToEntity);
    }

    async findById(id: string): Promise<Tenant | null> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        return tenant ? this.mapToEntity(tenant) : null;
    }

    async create(tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">, tx?: Prisma.TransactionClient): Promise<Tenant> {
        const client = tx || this.prisma;

        const newTenant = await client.tenant.create({
            data: {
                companyName: tenant.companyName,
                subdomain: tenant.subDomain.toLowerCase().replace(/[^a-z0-9]/g, '')
            },
        });
        return this.mapToEntity(newTenant);
    }

    async update(id: string, tenant: Partial<Tenant>): Promise<Tenant> {
        const updatedTenant = await this.prisma.tenant.update({
            where: { id },
            data: {
                companyName: tenant.companyName,
                subdomain: tenant.subDomain?.toLowerCase().replace(/[^a-z0-9]/g, '')
            },
        });
        return this.mapToEntity(updatedTenant);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.tenant.delete({
            where: { id },
        });
    }

    private mapToEntity(tenant: PrismaTenant): Tenant {
        return {
            id: tenant.id,
            companyName: tenant.companyName,
            subDomain: tenant.subdomain,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt
        };
    }
}