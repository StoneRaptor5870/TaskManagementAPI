import { PrismaClient, Prisma } from "@prisma/client";
import { Tenant } from "../domain/entities/tenant";
import { ITenantRepository } from "../infrastructure/repositories/ITenantRepository";
import { TenantRepository } from "../infrastructure/repositories/tenantRepository";
import db from "../infrastructure/database/prisma";

export class TenantService {
    private prisma: PrismaClient;
    private tenantRepository: ITenantRepository;

    constructor() {
        this.prisma = db;
        this.tenantRepository = new TenantRepository();
    }

    getPrismaInstance(): PrismaClient {
        return this.prisma;
    }

    async getAllTenants(): Promise<Tenant[]> {
        return this.tenantRepository.findAll();
    }

    async getTenantById(id: string): Promise<Tenant | null> {
        return this.tenantRepository.findById(id);
    }

    async createTenant(
        tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>,
        tx?: Prisma.TransactionClient
    ): Promise<Tenant> {
        return await this.tenantRepository.create(tenantData, tx);
    }

    async updateTenant(id: string, taskData: Partial<Tenant>): Promise<Tenant> {
        const existingTenant = await this.tenantRepository.findById(id);
        if (!existingTenant) {
            throw new Error(`Task with id ${id} not found`);
        }

        const updatedTask = await this.tenantRepository.update(id, taskData);
        return updatedTask;
    }

    async deleteTenant(id: string): Promise<void> {
        const existingTenant = await this.tenantRepository.findById(id);
        if (!existingTenant) {
            throw new Error(`Task with id ${id} not found`);
        }

        await this.tenantRepository.delete(id);
    }
}