import { Request, Response, NextFunction } from "express";

/**
 * CORS middleware tüm rotalarda CORS başlıklarını ekleyecek şekilde yapılandırır
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Tüm origin'lere izin ver
  res.header('Access-Control-Allow-Origin', '*');
  
  // İzin verilen methodları belirt
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  
  // İzin verilen header'ları belirt
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  
  // Preflight OPTIONS isteklerini hemen cevaplayalım
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Diğer istekler için bir sonraki middleware'e geçelim
  next();
}; 