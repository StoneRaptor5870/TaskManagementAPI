import { PrismaClient, Task as PrismaTask } from "@prisma/client";
import { Task } from "../../domain/entities/task";
import { ITaskRepository } from "./ITaskRespository";
import db from "../database/prisma";

export class TaskRepository implements ITaskRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = db;
    }

    async findAll(): Promise<Task[]> {
        const task = await this.prisma.task.findMany({
            include: {
                assignedTo: true,
                project: true,
            },
        });
        return task.map(this.mapToEntity);
    }

    async findById(id: string): Promise<Task | null> {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                assignedTo: true,
                project: true,
            },
        });
        return task ? this.mapToEntity(task) : null;
    }

    async create(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "projectId">): Promise<Task> {
        const newTask = await this.prisma.task.create({
            data: {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                // projectId: task.projectId,
                // assignedToId: task.assignedToId || null,
            },
            include: {
                assignedTo: true,
                project: true,
            },
        });
        return this.mapToEntity(newTask);
    }

    async update(id: string, task: Partial<Task>): Promise<Task> {
        const updatedTask = await this.prisma.task.update({
            where: { id },
            data: {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                projectId: task.projectId,
                // assignedToId: task.assignedToId,
            },
            include: {
                assignedTo: true,
                project: true,
            },
        });
        return this.mapToEntity(updatedTask);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.task.delete({
            where: { id },
        });
    }

    private mapToEntity(task: PrismaTask & { assignedTo?: any; project?: any }): Task {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate || new Date(task.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            // projectId: task.projectId,
            // assignedToId: task.assignedToId || '',
            // assignedTo: task.assignedTo,
            // project: task.project,
        };
    }
}