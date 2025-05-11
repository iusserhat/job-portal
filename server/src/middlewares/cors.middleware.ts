import { Request, Response, NextFunction } from "express";

/**
 * CORS middleware tüm rotalarda CORS başlıklarını ekleyecek şekilde yapılandırır
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // İzin verilen origin listesi (üretimde kullanılan domainler)
  const allowedOrigins = [
    'https://serene-begonia-ded421.netlify.app', // Netlify frontend
    'https://job-portal-gfus.onrender.com',      // Render backend
    'http://localhost:5138',                     // Vite dev server
    'http://localhost:5137',                     // Docker client
    'http://localhost:3000'                      // Alternatif dev port
  ];

  // Gelen isteğin origin header'ını al
  const origin = req.headers.origin;
  
  // Origin başlığı varsa ve izin verilen listede ise, bu origin'e özel izin ver
  // Yoksa genel * ile tüm origin'lere izin ver (geliştirme için güvenli)
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Credentials (çerezler, yetkilendirme başlıkları) paylaşımına izin ver
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // İzin verilen HTTP methodları
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  
  // İzin verilen header'lar
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, X-CSRF-Token');
  
  // Preflight yanıtlarının önbelleğe alınma süresi (saniye)
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 saat
  
  // OPTIONS isteği (preflight) ise hemen 200 OK ile yanıt ver
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Diğer tüm istekler için bir sonraki middleware'e geç
  next();
}; 