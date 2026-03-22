/**
 * Shared utilities for handler unit tests
 */

export function expectErrorThrown<E extends Error>(
  fn: () => Promise<void> | void,
  ErrorClass: new (...args: any[]) => E,
  expectedMessage?: string | RegExp
): void {
  const fn_inner = async () => {
    try {
      await fn();
      throw new Error(`Expected ${ErrorClass.name} to be thrown but nothing was thrown`);
    } catch (err) {
      if (!(err instanceof ErrorClass)) {
        throw new Error(`Expected ${ErrorClass.name} but got ${(err as any)?.constructor?.name || typeof err}: ${err}`);
      }
      if (expectedMessage !== undefined) {
        const errMsg = (err as any).message || String(err);
        if (typeof expectedMessage === 'string') {
          if (errMsg !== expectedMessage) {
            throw new Error(`Expected message "${expectedMessage}" but got "${errMsg}"`);
          }
        } else if (!expectedMessage.test(errMsg)) {
          throw new Error(`Expected message to match ${expectedMessage} but got "${errMsg}"`);
        }
      }
    }
  };
  return fn_inner() as any;
}
