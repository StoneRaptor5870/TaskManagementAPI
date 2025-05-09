import { Tenant } from "../../domain/entities/tenant";

export interface ITenantRepository {
    findAll(): Promise<Tenant[]>;
    findById(id: string): Promise<Tenant | null>;
    create(task: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant>;
    update(id: string, task: Partial<Tenant>): Promise<Tenant>;
    delete(id: string): Promise<void>;
}