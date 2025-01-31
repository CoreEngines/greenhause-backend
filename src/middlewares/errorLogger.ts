import { Request, Response, NextFunction } from 'express';
import { logEvents } from './logger';

export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction): void {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errlog.log");
    console.error(err.stack);

    const status =  res.statusCode ? res.statusCode : 500;
    res.status(status);
    res.json({ error: err.message });
}