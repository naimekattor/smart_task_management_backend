import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';

export function validateBody(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
