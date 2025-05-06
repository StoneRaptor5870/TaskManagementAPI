import { PrismaClient, Project as PrismaProject } from "@prisma/client";
import { Project } from "../../domain/entities/project";
import { IProjectRepository } from "./IProjectRepository";
import db from "../database/prisma";

export class ProjectRepository implements IProjectRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = db;
    }

    async findAll(): Promise<Project[]> {
        const project = await this.prisma.project.findMany({
            include: {
                owner: true,
                tasks: true,
            },
        });
        return project.map(this.mapToEntity);
    }

    async findById(id: string): Promise<Project | null> {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                owner: true,
                tasks: true,
            },
        });
        return project ? this.mapToEntity(project) : null;
    }

    async create(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
        const newProject = await this.prisma.project.create({
            data: {
                name: project.name,
                description: project.description,
                ownerId: project.ownerId
            },
            include: {
                owner: true,
                tasks: true,
            },
        });
        return this.mapToEntity(newProject);
    }

    async update(id: string, project: Partial<Project>): Promise<Project> {
        const updateProject = await this.prisma.project.update({
            where: { id },
            data: {
                name: project.name,
                description: project.description,
                ownerId: project.ownerId
            },
            include: {
                owner: true,
                tasks: true,
            },
        });
        return this.mapToEntity(updateProject);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.project.delete({
            where: { id },
        });
    }

    private mapToEntity(project: PrismaProject): Project {
        return {
            id: project.id,
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            ownerId: project.ownerId
        };
    }
}