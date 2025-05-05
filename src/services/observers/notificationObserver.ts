import { EventBus } from "./eventBus";
import { Task } from "../../domain/entities/task";

export interface TaskEventPayload {
    task: Task;
    event: 'created' | 'updated' | 'deleted';
}

export class NotificationObserver {
    private eventBus: EventBus;

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.init();
    }

    private init(): void {
        this.eventBus.subscribe<TaskEventPayload>('task:updated', this.handleTaskUpdate.bind(this));
        this.eventBus.subscribe<TaskEventPayload>('task:created', this.handleTaskCreated.bind(this));
        this.eventBus.subscribe<TaskEventPayload>('task:deleted', this.handleTaskDeleted.bind(this));
    }

    private async handleTaskUpdate(payload: TaskEventPayload): Promise<void> {
        if (!payload.task.assignedToId) return;

        console.log(`Sending notification for task update: ${payload.task.title}`);
        // TODO: this would send a notification to the user
        // e.g., through a notification service, websocket, etc.
    }

    private async handleTaskCreated(payload: TaskEventPayload): Promise<void> {
        if (!payload.task.assignedToId) return;

        console.log(`Sending notification for new task assigned: ${payload.task.title}`);
        // TODO: this would send a notification to the user
    }

    private async handleTaskDeleted(payload: TaskEventPayload): Promise<void> {
        if (!payload.task.assignedToId) return;

        console.log(`Sending notification for task deletion: ${payload.task.title}`);
        // TODO: this would send a notification to the user
    }
}