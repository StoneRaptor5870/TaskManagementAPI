import { Prisma } from "@prisma/client";
import { User } from '../../domain/entities/user';

export interface IUserRepository {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, tx?: Prisma.TransactionClient): Promise<User>;
    update(id: string, user: Partial<User>, tx?: Prisma.TransactionClient): Promise<User>;
    updateRefreshToken(userId: string, refreshToken: string | null, tx?: Prisma.TransactionClient): Promise<User>;
    delete(id: string): Promise<void>;
    deleteWithCleanup(id: string): Promise<void>;
}