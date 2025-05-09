import { Tenant } from "../domain/entities/tenant";
import { ITenantRepository } from "../infrastructure/repositories/ITenantRepository";
import { TenantRepository } from "../infrastructure/repositories/tenantRepository";

export class TenantService {
    private tenatRepository: ITenantRepository;

    constructor() {
        this.tenatRepository = new TenantRepository();
    }

    async getAllTenants(): Promise<Tenant[]> {
        return this.tenatRepository.findAll();
    }

    async getTenantById(id: string): Promise<Tenant | null> {
        return this.tenatRepository.findById(id);
    }

    async createTenant(taskData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
        const createdTask = await this.tenatRepository.create(taskData)
        return createdTask;
    }

    async updateTenant(id: string, taskData: Partial<Tenant>): Promise<Tenant> {
        const existingTenant = await this.tenatRepository.findById(id);
        if (!existingTenant) {
            throw new Error(`Task with id ${id} not found`);
        }

        const updatedTask = await this.tenatRepository.update(id, taskData);
        return updatedTask;
    }

    async deleteTenant(id: string): Promise<void> {
        const existingTenant = await this.tenatRepository.findById(id);
        if (!existingTenant) {
            throw new Error(`Task with id ${id} not found`);
        }

        await this.tenatRepository.delete(id);
    }
}