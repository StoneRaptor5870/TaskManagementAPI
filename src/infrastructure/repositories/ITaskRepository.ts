import { Task } from "../../domain/entities/task";

export interface ITaskRepository {
    findAll(): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
    update(id: string, task: Partial<Task>): Promise<Task>;
    delete(id: string): Promise<void>;
}