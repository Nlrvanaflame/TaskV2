import { NextFunction, Request, Response } from 'express';

function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const { method, path , body} = req;

  console.log(`[${new Date().toISOString()}] ${method} ${path} ${JSON.stringify(body || "")}`);
  next();
}

export default loggingMiddleware;