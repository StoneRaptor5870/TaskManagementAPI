import { Prisma } from "@prisma/client";
import { Tenant } from "../../domain/entities/tenant";

export interface ITenantRepository {
    findAll(): Promise<Tenant[]>;
    findById(id: string): Promise<Tenant | null>;
    create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>, tx?: Prisma.TransactionClient): Promise<Tenant>;
    update(id: string, task: Partial<Tenant>): Promise<Tenant>;
    delete(id: string): Promise<void>;
}