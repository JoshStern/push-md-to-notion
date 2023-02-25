import { AsyncLocalStorage } from 'node:async_hooks';

import { NotionApi } from './notion';

interface ActionCtx {
  notion: NotionApi;
}
class ContextError extends Error {}

export const actionStore = new AsyncLocalStorage<ActionCtx>();

/**
 * Get the current action context. If this is called outside of the corresponding run then it will throw an error.
 * @returns The active context.
 */
export function getCtx() {
  const ctx = actionStore.getStore();
  if (ctx === undefined) {
    throw new ContextError(
      'Get context must be called within the action function call!'
    );
  }
  return ctx;
}
