import { logger } from './logger';

export const tryAgain = async <T>(
  func: (...args: any) => T | Promise<T>,
  { tries = 1, timeout = Infinity }
): Promise<T> => {
  if (tries < 1) {
    tries = 1;
  }

  const startTime = Date.now();

  let attempts = 0;
  let lastErr: Error;

  while (tries >= 1) {
    const timeSinceStart = Date.now() - startTime;

    if (timeout - timeSinceStart <= 0) {
      throw new Error('Timeout expired for tryAgain');
    }

    attempts++;

    try {
      return await func();
    } catch (error) {
      logger.error({ error }, `Try #${attempts} didn't work.`);
      lastErr = error;
    }

    tries--;
  }

  throw lastErr;
};
