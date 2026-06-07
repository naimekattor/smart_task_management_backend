import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Error Handler]:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle custom validation rule messages (duplicate title, completed reassignment, etc.)
  const status = err.status || 400;
  return res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: [],
  });
}
