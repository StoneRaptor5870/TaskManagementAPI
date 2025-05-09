import { Request, Response } from "express";
import { TenantService } from "../../services/tenant.service";
import { Tenant } from "../../domain/entities/tenant";

export class TenantController {
    private tenantService: TenantService

    constructor() {
        this.tenantService = new TenantService();
    }

    getAllTenant = async (req: Request, res: Response): Promise<void> => {
        try {
            const tenants = await this.tenantService.getAllTenants;
            res.status(200).json(tenants);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    getTenantById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const tenant = await this.tenantService.getTenantById(id);

            if (!tenant) {
                res.status(404).json({ message: `Tenant with id ${id} not found` });
                return;
            }

            res.status(200).json(tenant);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    createTenant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { companyName, subDomain } = req.body;

            const tenant = await this.tenantService.createTenant({
                companyName,
                subDomain
            });

            res.status(201).json(tenant);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    updateTenant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const tenantData = req.body;

            const updatedTenant = await this.tenantService.updateTenant(id, tenantData);
            res.status(200).json(updatedTenant);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    deleteTenant = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.tenantService.deleteTenant(id);
            res.status(204).json("Tenant deleted.")
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}