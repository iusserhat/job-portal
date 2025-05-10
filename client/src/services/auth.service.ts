// AuthService.ts

// This service is responsible for handling authentication requests.

import HttpService from "@/core/http.service";
import { IModels } from "@/interfaces";
import StorageService from "@/core/storage.service";

export default class AuthService {
  private http: HttpService;
  private isDevelopment: boolean;

  constructor() {
    this.http = new HttpService();
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  // Login user
  public async login(payload: IModels.ILoginPayload, options?: any) {
    try {
      // Kullanıcı tipini kontrol et ve logla
      if (payload.user_type_id) {
        console.log("Login isteği gönderiliyor. Kullanıcı tipi:", payload.user_type_id);
      } else {
        console.log("Login isteği gönderiliyor (rol belirtilmeden)");
      }
      
      // API isteği yap
      try {
        const loginUrl = "api/v1/auth/login";
        console.log("Login URL:", loginUrl);
        
        // Payload'ı hazırla
        const loginData = {
          email: payload.email,
          password: payload.password,
          user_type_id: payload.user_type_id // Kullanıcı tipini string formatında gönder
        };
        
        console.log("Login payload:", JSON.stringify(loginData));
        
        // API isteğini yap
        const response = await this.http
          .service()
          .post<IModels.ILoginResponse, IModels.ILoginPayload>(
            loginUrl,
            loginData,
            options
          );
        
        console.log("API'den gelen login yanıtı:", response);
        
        // Yanıt kontrolü
        if (!response || !response.token || !response.user) {
          console.error("API'den gelen yanıt eksik veri içeriyor");
          throw new Error("Giriş yapılamadı, eksik veri");
        }
        
        // Token'ı kaydet
        StorageService.setItem("access_token", response.token);
        console.log("API'den alınan token kaydedildi");
        
        return response;
      } catch (apiError: any) {
        console.error("API login hatası:", apiError);
        
        // Tüm hata nesnesini detaylı görüntüle
        console.error("Hata detayları:", {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        
        if (apiError.response && apiError.response.data) {
          const errorData = apiError.response.data;
          console.error("API hata detayı:", errorData);
          
          // Rol uyuşmazlığı hatası varsa özel mesaj döndür
          if (errorData.message && errorData.message.includes("rolü ile giriş yapamaz")) {
            throw new Error(errorData.message);
          } else if (apiError.response.status === 401) {
            throw new Error("Giriş yapılamadı. E-posta/şifre yanlış veya hesap tipiniz farklı olabilir.");
          } else {
            throw new Error(errorData.message || "Sunucu hatası. Lütfen daha sonra tekrar deneyiniz.");
          }
        } else {
          throw new Error("Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyiniz.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register user
  public async register(payload: IModels.IRegisterPayload, options?: any) {
    try {
      // Gerçek API isteği yap
      try {
        // URL'yi düzelt
        const registerUrl = "api/v1/auth/signup"; // Doğru API path 
        console.log("Register URL:", registerUrl);
        
        // Debug: payload içeriğini kontrol et
        console.log("Register payload:", JSON.stringify(payload));
        
        const response = await this.http
          .service()
          .post<any, IModels.IRegisterPayload>(
            registerUrl,
            payload,
            options
          );
        
        console.log("API'den gelen register yanıtı:", response);
        return response;
      } catch (apiError: any) {
        console.error("API register hatası:", apiError);
        
        // API hatasını direkt fırlat, mock veri kullanma
        if (apiError.response && apiError.response.data) {
          throw apiError;
        } else {
          throw new Error("Sunucu bağlantı hatası. Lütfen daha sonra tekrar deneyiniz.");
        }
      }
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  // Get current user
  public async getCurrentUser() {
    try {
      // Önce localStorage'da kayıtlı kullanıcı bilgisini kontrol et
      const storedUserData = StorageService.getItem("user_data");
      const storedToken = StorageService.getItem("access_token");
      
      if (!storedToken) {
        console.log("getCurrentUser - Access token bulunamadı, oturum açılmamış");
        throw new Error("Oturum açılmamış");
      }
      
      // Gerçek API isteği yap
      try {
        // URL düzeltme
        const meUrl = "api/v1/auth/me";
        console.log("getCurrentUser URL:", meUrl);
        
        const response = await this.http.service().get<IModels.IUserAccount>(meUrl, {});
        console.log("API'den gelen kullanıcı bilgisi:", response);
        
        // Kullanıcı bilgilerini localStorage'a kaydet
        if (response) {
          // User_type_id'yi olduğu gibi koru
          StorageService.setItem("user_data", JSON.stringify(response));
          return response;
        }
      } catch (apiError) {
        console.error("API kullanıcı bilgisi hatası:", apiError);
        
        // API hatası varsa ve localStorage'da kayıtlı veri varsa
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log("getCurrentUser - API hatası, LocalStorage'daki veri kullanılıyor:", userData);
            
            if (!userData.user_type_id) {
              console.error("getCurrentUser - Hata: Kullanıcı tipsi bilgisi eksik, oturum sonlandırılıyor");
              this.logout(); // Oturumu temizle
              throw new Error("Kullanıcı bilgileri geçersiz");
            }
            
            return userData;
          } catch (parseError) {
            console.error("getCurrentUser - LocalStorage user data parse hatası:", parseError);
            this.logout(); // Oturumu temizle
            throw new Error("Kullanıcı bilgileri geçersiz");
          }
        }
        
        // LocalStorage'da veri yoksa veya hatası varsa, oturumu sonlandır
        this.logout();
        throw apiError;
      }
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }

  // Logout user
  public async logout() {
    try {
      // Her durumda önce local storage'ı temizle
      StorageService.removeItem("access_token");
      StorageService.removeItem("user_data");
      
      // Gerçek API isteği yap
      try {
        // URL düzelt
        const logoutUrl = "api/v1/auth/logout";
        await this.http.service().post(logoutUrl, {});
        console.log("API'den çıkış yapıldı");
      } catch (apiError) {
        console.error("API logout hatası:", apiError);
        // Bu hatayı görmezden gelebiliriz, çünkü zaten client tarafında temizlik yaptık
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
}
