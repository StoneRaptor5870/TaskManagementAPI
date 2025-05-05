import express from "express";
import cors from "cors";
import { taskRoutes } from "./api/routes/taskRoutes";
import { NotificationObserver } from "./services/observers/notificationObserver";
import { EmailObserver } from "./services/observers/emailObserver";

export const app = express();

// Initialize observers
new NotificationObserver();
new EmailObserver();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

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