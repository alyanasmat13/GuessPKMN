import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

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

  // Generic Logging to Console (In production, use Winston/Pino)
  console.error(`[Error] ${req.method} ${req.path}`, err.message);

  // Catch HTTP Fetch Errors from external API
  if (err.message.includes('status 404')) {
    res.status(404).json({ error: 'Pokemon API Resource Not Found' });
    return;
  }

  // Default Server Error Response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the backend'
  });
};
