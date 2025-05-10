import bcrypt from "bcrypt";
import { User } from "../domain/entities/user";
import { IUserRepository } from "../infrastructure/repositories/IUserRepository";
import { UserRepository } from "../infrastructure/repositories/userRepository";
import { AuthTokens, RegisterUserDto } from "../domain/entities/auth";
import { Prisma } from "@prisma/client";

export class UserService {
    private userRepository: IUserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, tx?: Prisma.TransactionClient): Promise<User> {
        return await this.userRepository.create(userData, tx);
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new Error(`User with id ${id} not found`);
        }
        return this.userRepository.update(id, userData);
    }

    async deleteUser(id: string): Promise<boolean> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new Error(`User with id ${id} not found`);
        }
        await this.userRepository.delete(id);
        return true;
    }

    async getCurrentUser(userId: string): Promise<User | null> {
        return this.userRepository.findById(userId);
    }

    async updateCurrentUser(userId: string, userData: {
        name?: string;
        email?: string;
    }): Promise<User | null> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new Error(`User with id ${userId} not found`);
        }
        return this.userRepository.update(userId, userData);
    }

    async updateRefreshToken(
        userId: string,
        refreshToken: string | null,
        tx?: Prisma.TransactionClient): Promise<User | null> {
            return await this.userRepository.updateRefreshToken(userId, refreshToken, tx);
    }

    async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<User | null> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new Error(`User with id ${userId} not found`);
        }

        // Verify the current password matches
        const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        // Hash the new password before updating
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return this.userRepository.update(userId, { password: hashedPassword });
    }

    async deleteCurrentUser(userId: string): Promise<boolean> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            throw new Error(`User with id ${userId} not found`);
        }

        await this.userRepository.deleteWithCleanup(userId);
        return true;
    }
}