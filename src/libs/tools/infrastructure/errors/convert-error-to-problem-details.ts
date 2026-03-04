import {Request} from 'express';

import {CustomError} from '@/libs/dto/domain';

const convertErrorToProblemDetails = (err: Error, statusCode: number, req: Request) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  if (err instanceof CustomError) {
    const errors = err.serializeErrors();
    return {
      type: `https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/${err.statusCode}`,
      title: err.title,
      status: statusCode,
      traceId: req.traceId,
      detail: errors[0]?.message || 'Validation failed',
      errors: errors,
    };
  }

  return {
    type: `${baseUrl}/problems/server-error`,
    title: 'Server Error',
    status: statusCode,
    detail: 'Something went wrong',
  };
};
export {convertErrorToProblemDetails};
