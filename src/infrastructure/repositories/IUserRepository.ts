import { User } from '../../domain/entities/user';

export interface IUserRepository {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    update(id: string, user: Partial<User>): Promise<User>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<User>;
    delete(id: string): Promise<void>;
}