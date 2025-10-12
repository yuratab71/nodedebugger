import type { IStrategy } from "../types/strategy.types";
import { Logger } from "./logger";

type Task<T> = () => Promise<T>;

export class TaskQueueRunner {
    static #instance: TaskQueueRunner | null;

    private readonly logger: Logger;
    private readonly queue: Task<unknown>[] = [];
    private isProcessing = false;

    private constructor() {
        this.logger = new Logger("QUEUE PROCESSOR");
    }

    public static instance(): TaskQueueRunner {
        if (TaskQueueRunner.#instance === null) {
            TaskQueueRunner.#instance = new TaskQueueRunner();
        }

        return TaskQueueRunner.#instance;
    }

    public enqueue<T>(strategy: IStrategy<T>): Promise<void> {
        return new Promise((resolve) => {
            this.queue.push(async () => {
                await strategy.run();
                resolve();
            });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task != null) {
                await task();
                this.logger.log("finished task");
            }
        }
        this.isProcessing = false;
    }
}
