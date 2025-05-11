import { IProjectRepository } from "../infrastructure/repositories/IProjectRepository";
import { ProjectRepository } from "../infrastructure/repositories/projectRepository";
import { Project, ProjectDTO } from "../domain/entities/project";
import { NotFoundError } from '../infrastructure/error/errorTypes';

export class ProjectService {
    private projectRepository: IProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    async getAllProjects(): Promise<Project[]> {
        return this.projectRepository.findAll();
    }

    async getProjectById(id: string): Promise<Project | null> {
        return this.projectRepository.findById(id);
    }

    async createProject(projectData: ProjectDTO): Promise<Project> {
        const createdProject = await this.projectRepository.create(projectData);
        return createdProject;
    }

    async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
        const existingProject = await this.projectRepository.findById(id);
        if (!existingProject) {
            throw new NotFoundError(`Project with id ${id} not found`);
        }

        const updatedProject = await this.projectRepository.update(id, projectData);
        return updatedProject;
    }

    async deleteProject(id: string): Promise<void> {
        const existingTask = await this.projectRepository.findById(id);
        if (!existingTask) {
          throw new NotFoundError(`Project with id ${id} not found`);
        }

        await this.projectRepository.delete(id);
    }
}