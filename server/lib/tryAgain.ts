import { logger } from './logger';

export const tryAgain = async <T>(
  func: (...args: any) => T | Promise<T>,
  tries = 1
): Promise<T> => {
  if (tries < 1) {
    tries = 1;
  }

  let attempts = 0;
  let lastErr: Error;

  while (tries >= 1) {
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
