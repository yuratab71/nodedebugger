import { IStrategy } from "../types/strategy";
import { Logger } from "./logger";

type Task<T> = () => Promise<T>;

export class TaskQueueRunner {
    logger: Logger;
    queue: Task<any>[] = [];
    private isProcessing: boolean = false;

    static #instance: TaskQueueRunner;

    static instance(): TaskQueueRunner {
        if (!TaskQueueRunner.#instance) {
            TaskQueueRunner.#instance = new TaskQueueRunner();
        }

        return TaskQueueRunner.#instance;
    }

    private constructor() {
        this.logger = new Logger("QUEUE PROCESSOR");
    }

    enqueue<T>(strategy: IStrategy<T>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await strategy.run();

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
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
            if (task) {
                await task();
                this.logger.log("finished task");
            }
        }
        this.isProcessing = false;
    }
}
