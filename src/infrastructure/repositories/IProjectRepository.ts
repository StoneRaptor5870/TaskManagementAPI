import { Project } from "../../domain/entities/project";

export interface IProjectRepository {
    findAll(): Promise<Project[]>;
    findById(id: string): Promise<Project | null>;
    create(task: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
    update(id: string, task: Partial<Project>): Promise<Project>;
    delete(id: string): Promise<void>;
}
