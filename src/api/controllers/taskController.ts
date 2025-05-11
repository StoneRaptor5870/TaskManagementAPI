import { Request, Response } from 'express';
import { Priority, Status } from '@prisma/client';
import { TaskService } from '../../services/taskService';
import { catchAsync } from '../../infrastructure/error/errorHandler';
import { NotFoundError, ValidationError } from '../../infrastructure/error/errorTypes';

export class TaskController {
    private taskService: TaskService;

    constructor() {
        this.taskService = new TaskService();
    }

    getAllTasks = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const tasks = await this.taskService.getAllTasks();
        res.status(200).json(tasks);
    });

    getTaskById = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const task = await this.taskService.getTaskById(id);

        if (!task) {
            throw new NotFoundError(`Task with id ${id} not found`);
        }

        res.status(200).json(task);
    });

    createTask = catchAsync(async (req: Request, res: Response): Promise<void> => {
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
    });

    updateTask = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const taskData = req.body;

        if (taskData.dueDate) {
            taskData.dueDate = new Date(taskData.dueDate);
        }

        const updatedTask = await this.taskService.updateTask(id, taskData);
        res.status(200).json(updatedTask);
    });

    deleteTask = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        await this.taskService.deleteTask(id);
        res.status(204).send("Task Deleted");
    });

    updateTaskStatus = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(Status).includes(status)) {
            throw new ValidationError('Invalid status value');
        }

        const updatedTask = await this.taskService.updateTaskStatus(id, status);
        res.status(200).json(updatedTask);
    });

    assignTask = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { userId } = req.body;

        const updatedTask = await this.taskService.assignTask(id, userId);
        res.status(200).json(updatedTask);
    });
}