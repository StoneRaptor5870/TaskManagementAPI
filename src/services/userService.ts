import { User } from "../domain/entities/user";
import { IUserRepository } from "../infrastructure/repositories/IUserRepository";
import { UserRepository } from "../infrastructure/repositories/userRepository";

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
}