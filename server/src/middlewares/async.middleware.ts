import { Request, Response, NextFunction } from "express";

/**
 * Async işlemlerini yakalayıp hataları global hata yakalayıcıya ileten middleware
 * @param fn Async controller fonksiyonu
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 