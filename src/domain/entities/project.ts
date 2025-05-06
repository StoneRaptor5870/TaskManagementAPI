export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
}

export interface ProjectDTO {
    name: string;
    description: string;
    ownerId: string;
}