interface BatchOptions {
  size: number;
}
const DEFAULT_BATCH_OPTS: BatchOptions = {
  size: 10,
};

/**
 * Given a set of items split it into batches to be run individually.
 * @param items Set of items to execute the batch operation on
 * @param fn Function run on each batch.
 */
export async function batch<T>(
  items: Array<T>,
  fn: (batch: Array<T>, index: number) => {},
  opts: Partial<BatchOptions> = {},
) {
  const batchOpts = { ...DEFAULT_BATCH_OPTS, ...opts };

  for (let i = 0; i < items.length; i += batchOpts.size) {
    const batch = items.slice(i, i + batchOpts.size);
    await fn(batch, i);
  }
}
