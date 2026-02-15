import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "Not Found",
    details: [`Route ${req.method} ${req.originalUrl} does not exist`],
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof Error) {
    res.status(500).json({
      error: "Internal Server Error",
      details: [err.message],
    });
    return;
  }

  res.status(500).json({ error: "Internal Server Error" });
}
