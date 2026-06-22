import { Request, Response, NextFunction } from 'express';
import { logger } from '@analytics/shared-utils';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, err);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};
