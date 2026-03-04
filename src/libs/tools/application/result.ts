type ErrorPayload = {
  code: string;
  message: string;
  payload?: unknown;
};

class ResultError {
  protected readonly _error: ErrorPayload;

  constructor(error: ErrorPayload) {
    this._error = error;
  }

  public get error(): ErrorPayload {
    return this._error;
  }

  public static NotFound(error: ErrorPayload) {
    return Result.Error(new ResultNotFoundError(error));
  }

  public static ConflictError(error: ErrorPayload) {
    return Result.Error(new ResultConflictError(error));
  }

  public static UnexpectedError(error: ErrorPayload) {
    return Result.Error(new ResultUnexpectedError(error));
  }
}

class ResultNotFoundError extends ResultError {}
class ResultConflictError extends ResultError {}
class ResultUnexpectedError extends ResultError {}

class Result<T = void, E extends ResultError = ResultError> {
  private readonly _value: T | null;
  private readonly _error: E | null;

  private constructor(value: T | null, error: E | null) {
    this._value = value;
    this._error = error;
  }

  public get value(): T | null {
    return this._value;
  }

  public get error(): E | null {
    return this._error;
  }

  public get isError(): boolean {
    return this._error !== null;
  }

  public get isOk(): boolean {
    return !this.isError;
  }

  /**
   * Create a success result with a value
   */
  public static Ok<T = void, E extends ResultError = ResultError>(value?: T): Result<T, E> {
    return new Result<T, E>(value as T, null);
  }

  /**
   * Create a failure result with an error
   */
  public static Error<T = void, E extends ResultError = ResultError>(error: E): Result<T, E> {
    return new Result<T, E>(null, error);
  }

  /**
   * Map success value to another value
   */
  public map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isOk ? Result.Ok<U, E>(fn(this._value as T)) : Result.Error<U, E>(this._error as E);
  }

  /**
   * Handle both success and failure cases
   */
  public match<U>(okCallback: (value: T) => U, errorCallback: (error: E) => U): U {
    return this.isOk ? okCallback(this._value as T) : errorCallback(this._error as E);
  }
}

// For backwards compatibility
type ErrorOr<T, E extends ResultError = ResultError> = Result<T, E>;

export type {ErrorOr};
export {Result, ResultConflictError, ResultError, ResultNotFoundError, ResultUnexpectedError};
