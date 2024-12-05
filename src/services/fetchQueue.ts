import { sleep } from '../utils/helpers';

interface QueueItem<T> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

class FetchQueue {
  private queue: QueueItem<any>[] = [];
  private isProcessing = false;
  private rateLimitDelay = 1000; // 1 second between requests

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        const result = await item.task();
        item.resolve(result);
      } catch (error) {
        item.reject(error instanceof Error ? error : new Error(String(error)));
      }

      // Wait before processing next request to avoid rate limiting
      await sleep(this.rateLimitDelay);
    }

    this.isProcessing = false;
  }
}

export const fetchQueue = new FetchQueue();