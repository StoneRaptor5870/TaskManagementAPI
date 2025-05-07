import { Priority, Status } from "@prisma/client";
import { User } from "./user";
import { Project } from "./project";

export interface Task {
    id: string;
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    project?: Project;
    assignedToId: string | null;
    assignedTo?: User;
}