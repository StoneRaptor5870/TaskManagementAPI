import { PrismaClient, User as PrismaUser, Role } from "@prisma/client";
import { User } from "../../domain/entities/user";
import { IUserRepository } from "./IUserRepository";
import db from "../database/prisma";

export class UserRepository implements IUserRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = db;
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany();
        return users.map(this.mapToEntity);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        return user ? this.mapToEntity(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        return user ? this.mapToEntity(user) : null;
    }

    async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const newUser = await this.prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
                password: user.password,
                role: user.role || Role.USER,
                refreshToken: user.refreshToken,
            },
        });
        return this.mapToEntity(newUser);
    }

    async update(id: string, user: Partial<User>): Promise<User> {
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                email: user.email,
                name: user.name,
                password: user.password,
                role: user.role,
                refreshToken: user.refreshToken,
            },
        });
        return this.mapToEntity(updatedUser);
    }

    async updateRefreshToken(userId: string, refreshToken: string | null): Promise<User> {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken,
            },
        });
        return this.mapToEntity(updatedUser);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }

    async deleteWithCleanup(id: string): Promise<void> {
        // Remove user assignments from tasks
        await this.prisma.task.deleteMany({
            where: { assignedToId: id }
        });

        // Delete all projects owned by the user
        await this.prisma.project.deleteMany({
            where: { ownerId: id }
        });

        // Delete the user
        await this.prisma.user.delete({
            where: { id }
        });
    }

    private mapToEntity(user: PrismaUser): User {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password,
            role: user.role,
            refreshToken: user.refreshToken || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}