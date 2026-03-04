import {Constructor, IHandler} from '@/libs/tools/domain';

export class Mediator {
  private handlers = new Map<Function, IHandler<any, any>>();

  /**
   * Register a handler for an input constructor (class)
   * @param inputCtor constructor function for the input type
   * @param handler instance that implements handle(input)
   */
  register<T, R>(inputCtor: Constructor<T>, handler: IHandler<T, R>): void {
    this.handlers.set(inputCtor, handler as IHandler<any, any>);
  }

  /**
   * Send an input to the mediator. It finds a registered handler by exact constructor
   * or by instanceof (checks registered keys) and calls its handle method.
   */
  async send<T, R>(input: T): Promise<R> {
    if (input == null) throw new Error('Input must not be null or undefined');

    const inputCtor = (input as any).constructor as Function;

    // direct constructor match
    let handler = this.handlers.get(inputCtor);

    if (!handler) {
      const name = inputCtor?.name ?? typeof input;
      throw new Error(`No handler registered for input type ${name}`);
    }

    return handler.handle(input);
  }
}
