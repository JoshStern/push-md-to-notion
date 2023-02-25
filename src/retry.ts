import { setTimeout } from 'node:timers/promises';

export class RetryError extends Error {
  constructor(message: string, public readonly failures: Error[]) {
    super(message);
  }
}

function expDelay(c: number, g: number, n: number): number {
  return c + g * Math.pow(2, n);
}

export async function retry<R>(
  fn: () => R,
  opts: { tries?: number; shouldRetry?: (res: R) => boolean } = {}
): Promise<R | RetryError> {
  const { tries = 2, shouldRetry = () => false } = opts;
  const errors: Error[] = [];
  for (let t = 0; t < tries; t++) {
    if (t > 0) {
      await setTimeout(expDelay(200, 100, t));
    }
    try {
      const res = await fn();
      if (shouldRetry(res)) {
        errors.push(new Error('Should retry failed'));
        continue;
      }
      return res;
    } catch (e) {
      if (e instanceof Error) {
        errors.push(e);
      } else {
        errors.push(new Error('Unknown reason'));
      }
      continue;
    }
  }
  return new RetryError(`Failed after ${tries} attepts`, errors);
}
