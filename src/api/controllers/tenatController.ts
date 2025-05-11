import { Request, Response } from "express";
import { TenantService } from "../../services/tenantService";
import { catchAsync } from "../../infrastructure/error/errorHandler";
import { NotFoundError } from '../../infrastructure/error/errorTypes';

export class TenantController {
    private tenantService: TenantService

    constructor() {
        this.tenantService = new TenantService();
    }

    getAllTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const tenants = await this.tenantService.getAllTenants();
        res.status(200).json(tenants);
    });

    getTenantById = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const tenant = await this.tenantService.getTenantById(id);

        if (!tenant) {
            throw new NotFoundError(`Tenant with id ${id} not found`);
        }

        res.status(200).json(tenant);
    });

    createTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { companyName, subDomain } = req.body;

        const tenant = await this.tenantService.createTenant({
            companyName,
            subDomain
        });

        res.status(201).json(tenant);
    });

    updateTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const tenantData = req.body;

        const updatedTenant = await this.tenantService.updateTenant(id, tenantData);
        res.status(200).json(updatedTenant);
    });

    deleteTenant = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        await this.tenantService.deleteTenant(id);
        res.status(204).json("Tenant deleted.")
    });
}