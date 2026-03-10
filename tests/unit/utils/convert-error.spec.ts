import {Request} from 'express';
import {CustomError} from '@/shared/domain/errors/custom-error';
import {convertErrorToProblemDetails} from '@/shared/utils/convert-error-to-problem-details';

class MyError extends CustomError {
  statusCode = 418;
  title = 'Teapot';
  constructor(public errors: Array<{message: string; field?: string}>) {
    super('ouch');
    Object.setPrototypeOf(this, MyError.prototype);
  }
  serializeErrors() {
    return this.errors;
  }
}

describe('convertErrorToProblemDetails', () => {
  it('converts custom error to problem details', () => {
    const err = new MyError([{message: 'bad', field: 'x'}]);
    const fakeReq: any = {protocol: 'http', get: (_: string) => 'localhost', traceId: 't1'} as unknown as Request;
    const pd = convertErrorToProblemDetails(err, 400, fakeReq);
    expect(pd.title).toBe('Teapot');
    expect(pd.status).toBe(400);
    expect(pd.errors?.[0].field).toBe('x');
  });

  it('converts normal error to server problem', () => {
    const err = new Error('boom');
    const fakeReq: any = {protocol: 'http', get: (_: string) => 'localhost', traceId: 't2'} as unknown as Request;
    const pd = convertErrorToProblemDetails(err, 500, fakeReq);
    expect(pd.title).toBe('Server Error');
    expect(pd.status).toBe(500);
  });
});
