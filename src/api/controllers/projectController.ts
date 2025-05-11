import { Request, Response } from 'express';
import { ProjectService } from '../../services/projectService';
import { catchAsync } from '../../infrastructure/error/errorHandler';
import { NotFoundError } from '../../infrastructure/error/errorTypes';

export class ProjectController {
    private projectService: ProjectService;

    constructor() {
        this.projectService = new ProjectService();
    }

    getAllProjects = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const projects = await this.projectService.getAllProjects();
        res.status(200).json(projects);
    });

    getProjectById = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const project = await this.projectService.getProjectById(id);

        if (!project) {
            throw new NotFoundError(`Project with id ${id} not found`);
        }

        res.status(200).json(project);
    });

    createProject = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const project = await this.projectService.createProject(req.body);
        res.status(201).json(project);
    });

    updateProject = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const projectData = req.body;

        const updatedProject = await this.projectService.updateProject(id, projectData);
        res.status(200).json(updatedProject);
    });

    deleteProject = catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        await this.projectService.deleteProject(id);
        res.status(204).send('Project Deleted');
    });

}