import express from "express";
import cors from "cors";
import morgan from 'morgan';
import { taskRoutes } from "./api/routes/taskRoutes";
import { NotificationObserver } from "./services/observers/notificationObserver";
import { EmailObserver } from "./services/observers/emailObserver";
import { authRoutes } from "./api/routes/authRoutes";
import { userRoutes } from "./api/routes/userRoutes";
import { projectRoutes } from "./api/routes/projectRoutes";
import { tenantMiddleware } from "./api/middleware/tenant";
import { clsMiddleware } from "./api/middleware/cls";
import { authMiddleware } from "./api/middleware/auth";
import { tenantRoutes } from "./api/routes/tenantRoutes";

export const app = express();

// Initialize observers
new NotificationObserver();
new EmailObserver();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// CLS middleware
app.use(clsMiddleware);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenant', tenantRoutes);
app.use('/api/v1/users', authMiddleware.authenticate, tenantMiddleware.attachTenant, userRoutes);
app.use('/api/v1/projects', authMiddleware.authenticate, tenantMiddleware.attachTenant, projectRoutes);
app.use('/api/v1/tasks', authMiddleware.authenticate, tenantMiddleware.attachTenant, taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});