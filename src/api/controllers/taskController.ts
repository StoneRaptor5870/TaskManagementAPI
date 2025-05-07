import { Request, Response } from 'express';
import { Priority, Status } from '@prisma/client';
import { TaskService } from '../../services/taskService';

export class TaskController {
    private taskService: TaskService;

    constructor() {
        this.taskService = new TaskService();
    }

    getAllTasks = async (req: Request, res: Response): Promise<void> => {
        try {
            const tasks = await this.taskService.getAllTasks();
            res.status(200).json(tasks);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    getTaskById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const task = await this.taskService.getTaskById(id);

            if (!task) {
                res.status(404).json({ message: `Task with id ${id} not found` });
                return;
            }

            res.status(200).json(task);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    createTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const { title, description, dueDate, priority, status, projectId, assignedToId } = req.body;

            const task = await this.taskService.createTask(
                {
                    title,
                    description,
                    status,
                    projectId,
                    assignedToId: assignedToId || null,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                },
                priority || Priority.MEDIUM
            );

            res.status(201).json(task);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    updateTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const taskData = req.body;

            if (taskData.dueDate) {
                taskData.dueDate = new Date(taskData.dueDate);
            }

            const updatedTask = await this.taskService.updateTask(id, taskData);
            res.status(200).json(updatedTask);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    };

    deleteTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.taskService.deleteTask(id);
            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    };

    updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!Object.values(Status).includes(status)) {
                res.status(400).json({ message: 'Invalid status value' });
                return;
            }

            const updatedTask = await this.taskService.updateTaskStatus(id, status);
            res.status(200).json(updatedTask);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    };

    assignTask = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { userId } = req.body;

            const updatedTask = await this.taskService.assignTask(id, userId);
            res.status(200).json(updatedTask);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    };
}