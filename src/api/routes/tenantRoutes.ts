import { Router } from "express";
import { TenantController } from "../controllers/tenatController";
import { authMiddleware } from "../middleware/auth";
import { tenantMiddleware } from "../middleware/tenant";
import { Role } from "@prisma/client";

const router = Router();
const tenantController = new TenantController();

router.post('/', tenantController.createTenant);

router.use(authMiddleware.authenticate,
    tenantMiddleware.attachTenant,
    authMiddleware.authorize([Role.ADMIN])
);

router.get('/', tenantController.getAllTenant);
router.get('/:id', tenantController.getTenantById);
router.patch('/:id', tenantController.updateTenant);
router.delete('/:id', tenantController.deleteTenant);

export const tenantRoutes = router;