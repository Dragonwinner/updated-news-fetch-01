export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = async (retryCount: number) => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        if (retryCount >= maxRetries) {
          reject(error);
          return;
        }
        
        const delay = baseDelay * Math.pow(2, retryCount);
        await sleep(delay);
        attempt(retryCount + 1);
      }
    };

    attempt(0);
  });
}