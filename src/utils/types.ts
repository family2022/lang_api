import { Request, Response, NextFunction } from 'express';

export type ExpressFunction = (
  req: Request & { user: any },
  res: Response,
  next: NextFunction
) => void | any;
