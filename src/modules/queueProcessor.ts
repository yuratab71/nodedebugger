import { Logger } from "./logger";

interface Task {
    name: string;
    fn: () => void;
}

export class QueueProcessor {
    logger: Logger;
    tasks: Task[] = [];

    static #instance: QueueProcessor;

    static instance(): QueueProcessor {
        if (!QueueProcessor.#instance) {
            QueueProcessor.#instance = new QueueProcessor();
        }

        return QueueProcessor.#instance;
    }

    private constructor() {
        this.logger = new Logger("QUEUE PROCESSOR");
    }

    addTask(task: Task) {
        this.tasks = [task, ...this.tasks];
        this.logger.log(
            `task added successfuly, tasks total: ${this.tasks.length}`,
        );
    }

    async run(): Promise<void> {
        while (this.tasks.length != 0) {
            const task = this.tasks[this.tasks.length - 1];

            if (task) {
                task.fn.call({});
                this.logger.log("task executed successfuly");
                this.tasks.pop();
            }
        }
    }
}
