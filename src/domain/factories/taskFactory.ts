import { Priority, Status } from "@prisma/client";
import { Task } from "@prisma/client";

export interface TaskCreationAttributes {
    title: string;
    description: string;
    status: Status;
    projectId: string;
    assignedToId?: string | null;
    dueDate?: Date;
}

// Abstract factory
export abstract class TaskFactory {
    abstract createTask(attributes: TaskCreationAttributes): Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
}

class LowPriorityTaskFactory extends TaskFactory {
    createTask(attributes: TaskCreationAttributes): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
        return {
            title: attributes.title,
            description: attributes.description,
            status: attributes.status || Status.TODO,
            priority: Priority.LOW,
            dueDate: attributes.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            projectId: attributes.projectId,
            assignedToId: attributes.assignedToId || null,
        };
    }
}

class MediumPriorityTaskFactory extends TaskFactory {
    createTask(attributes: TaskCreationAttributes): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
        return {
            title: attributes.title,
            description: attributes.description,
            status: attributes.status || Status.TODO,
            priority: Priority.MEDIUM,
            dueDate: attributes.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            projectId: attributes.projectId,
            assignedToId: attributes.assignedToId || null,
        };
    }
}

class HighPriorityTaskFactory extends TaskFactory {
    createTask(attributes: TaskCreationAttributes): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
        return {
            title: attributes.title,
            description: attributes.description,
            status: attributes.status || Status.TODO,
            priority: Priority.HIGH,
            dueDate: attributes.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            projectId: attributes.projectId,
            assignedToId: attributes.assignedToId || null,
        };
    }
}

export class TaskFactoryCreator {
    static getFactory(priority: Priority): TaskFactory {
        switch (priority) {
            case Priority.LOW:
                return new LowPriorityTaskFactory();
            case Priority.MEDIUM:
                return new MediumPriorityTaskFactory();
            case Priority.HIGH:
                return new HighPriorityTaskFactory();
            default:
                return new MediumPriorityTaskFactory();
        }
    }
}