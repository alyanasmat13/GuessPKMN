import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { config } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Catch Zod Validation Errors
  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.issues.map(e => e.message)
    });
    return;
  }

  const errorMessage = typeof err?.message === 'string' ? err.message : '';

  // Generic Logging to Console (full detail stays server-side only)
  console.error(`[Error] ${req.method} ${req.path}`, errorMessage);

  // Reject disallowed CORS origins explicitly.
  if (errorMessage === 'Not allowed by CORS') {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  // Catch HTTP Fetch Errors from external API
  if (errorMessage.includes('status 404')) {
    res.status(404).json({ error: 'Pokemon API Resource Not Found' });
    return;
  }

  // Honor a status code set on the error itself (e.g. body-parser's 413
  // "request entity too large") or already set on the response, before
  // falling back to a generic 500.
  const errStatus =
    typeof err?.status === 'number'
      ? err.status
      : typeof err?.statusCode === 'number'
      ? err.statusCode
      : undefined;
  const statusCode = errStatus ?? (res.statusCode !== 200 ? res.statusCode : 500);

  // For client errors (4xx) the message is safe and useful; for server
  // errors (5xx) in production we never leak the raw message, which could
  // expose internal file paths, dependency versions, or configuration.
  const safeMessage =
    statusCode < 500
      ? errorMessage || 'Bad Request'
      : config.IS_PRODUCTION
      ? 'Something went wrong on the backend'
      : errorMessage || 'Something went wrong on the backend';

  res.status(statusCode).json({
    error: statusCode < 500 ? 'Request Error' : 'Internal Server Error',
    message: safeMessage,
  });
};
