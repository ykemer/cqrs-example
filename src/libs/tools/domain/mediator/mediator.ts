export type Constructor<T> = new (...args: any[]) => T;

export interface IHandler<T, R> {
  handle(input: T): Promise<R>;
}
