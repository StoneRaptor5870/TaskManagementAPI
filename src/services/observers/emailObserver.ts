import { EventBus } from './eventBus';
// import { Task } from '../../domain/entities/task';
import { TaskEventPayload } from './notificationObserver';

export class EmailObserver {
    private eventBus: EventBus;

    constructor() {
        this.eventBus = EventBus.getInstance();
        this.init();
    }

    private init(): void {
        this.eventBus.subscribe<TaskEventPayload>('task:updated', this.handleTaskUpdate.bind(this));
        this.eventBus.subscribe<TaskEventPayload>('task:due_soon', this.handleTaskDueSoon.bind(this));
    }

    private async handleTaskUpdate(payload: TaskEventPayload): Promise<void> {
        if (!payload.task.assignedToId || payload.event !== 'updated') return;

        // Only send emails for significant updates, like status changes
        console.log(`Sending email notification for task status change: ${payload.task.title}`);
        // TODO: this would send an email using a service like SendGrid, etc.
    }

    private async handleTaskDueSoon(payload: TaskEventPayload): Promise<void> {
        if (!payload.task.assignedToId || !payload.task.dueDate) return;

        console.log(`Sending email reminder for task due soon: ${payload.task.title}`);
        // TODO: this would send an email reminder
    }
}