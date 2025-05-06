import { Request, Response } from 'express';
import { ProjectService } from '../../services/projectService';

export class ProjectController {
    private projectService: ProjectService;

    constructor() {
        this.projectService = new ProjectService();
    }

    getAllProjects = async (req: Request, res: Response): Promise<void> => {
        try {
            const projects = await this.projectService.getAllProjects();
            res.status(200).json(projects);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    getProjectById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const project = await this.projectService.getProjectById(id);

            if (!project) {
                res.status(404).json({ message: `Project with id ${id} not found` });
                return;
            }

            res.status(200).json(project);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    createProject = async (req: Request, res: Response): Promise<void> => {
        try {
            const project = await this.projectService.createProject(req.body);
            res.status(201).json(project);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    updateProject = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const projectData = req.body;

            const updatedProject = await this.projectService.updateProject(id, projectData);
            res.status(200).json(updatedProject);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(400).json({ message: error.message });
            }
        }
    }

    deleteProject = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.projectService.deleteProject(id);
            res.status(204).send('Projected Deleted');
        } catch (error: any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    };

}