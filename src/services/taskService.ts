import { Priority, Status } from "@prisma/client";
import { Task } from "../domain/entities/task";
import { ITaskRepository } from "../infrastructure/repositories/ITaskRepository";
import { TaskRepository } from "../infrastructure/repositories/taskRepository";
import { EventBus } from "./observers/eventBus";
import { TaskCreationAttributes, TaskFactoryCreator } from "../domain/factories/taskFactory";
import { TaskEventPayload } from "./observers/notificationObserver";

export class TaskService {
    private taskRepository: ITaskRepository;
    private eventBus: EventBus;

    constructor() {
        this.taskRepository = new TaskRepository();
        this.eventBus = EventBus.getInstance();
    }

    async getAllTasks(): Promise<Task[]> {
        return this.taskRepository.findAll();
    }

    async getTaskById(id: string): Promise<Task | null> {
        return this.taskRepository.findById(id);
    }

    async createTask(taskData: TaskCreationAttributes, priority: Priority = Priority.MEDIUM): Promise<Task> {
        // Use Factory Pattern to create task with specific priority settings
        const taskFactory = TaskFactoryCreator.getFactory(priority);
        const taskToCreate = taskFactory.createTask(taskData);

        // Use Repository Pattern to persist the task
        const createdTask = await this.taskRepository.create(taskToCreate)

        // Use Observer Pattern to notify about task creation
        this.eventBus.publish<TaskEventPayload>('task:created', {
            task: createdTask,
            event: 'created'
        });

        return createdTask;
    }

    async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
        const existingTask = await this.taskRepository.findById(id);
        if (!existingTask) {
            throw new Error(`Task with id ${id} not found`);
        }

        // Use Repository Pattern to update the task
        const updatedTask = await this.taskRepository.update(id, taskData);

        // Use Observer Pattern to notify about task update
        this.eventBus.publish<TaskEventPayload>('task:updated', {
            task: updatedTask,
            event: 'updated'
        });

        // Check if the task is due soon (within 24 hours) and notify
        if (updatedTask.dueDate) {
            const now = new Date();
            const timeDiff = updatedTask.dueDate.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            if (hoursDiff > 0 && hoursDiff <= 24) {
                this.eventBus.publish<TaskEventPayload>('task:due_soon', {
                    task: updatedTask,
                    event: 'updated'
                });
            }
        }

        return updatedTask;
    }

    async deleteTask(id: string): Promise<void> {
        const existingTask = await this.taskRepository.findById(id);
        if (!existingTask) {
            throw new Error(`Task with id ${id} not found`);
        }

        // Use Observer Pattern to notify about task deletion before it's gone
        this.eventBus.publish<TaskEventPayload>('task:deleted', {
            task: existingTask,
            event: 'deleted'
        });

        // Use Repository Pattern to delete the task
        await this.taskRepository.delete(id);
    }

    async updateTaskStatus(id: string, status: Status): Promise<Task> {
        return this.updateTask(id, { status });
    }

    async assignTask(id: string, userId: string): Promise<Task> {
        return this.updateTask(id, { assignedToId: userId });
    }
}