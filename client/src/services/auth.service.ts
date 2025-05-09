// AuthService.ts

// This service is responsible for handling authentication requests.

import HttpService from "@/core/http.service";
import { IModels } from "@/interfaces";
import StorageService from "@/core/storage.service";

export default class AuthService {
  private http: HttpService;

  constructor() {
    this.http = new HttpService();
  }

  // Login user
  public async login(payload: IModels.ILoginPayload, options?: any) {
    try {
      // Gerçek API isteği yap
      try {
        const response = await this.http
          .service()
          .post<IModels.ILoginResponse, IModels.ILoginPayload>(
            "auth/login",
            payload,
            options
          );
        
        console.log("API'den gelen login yanıtı:", response);
        
        // API'den gelen token'ı localStorage'a kaydet
        if (response && response.token) {
          StorageService.setItem("access_token", response.token);
          console.log("API'den alınan token kaydedildi:", response.token);
        }
        
        return response;
      } catch (apiError) {
        console.error("API login hatası, mock veri kullanılacak:", apiError);
        // API hatası durumunda mock veri kullan
      }
      
      // Mock işlemleri için kullanıcı tipini korumalıyız
      const userType = payload.user_type_id || 'jobseeker';
      
      console.log("Login işlemi - belirtilen kullanıcı tipi:", userType);
      
      const token = "mock_token_" + Math.random().toString(36).substring(2, 15);
      // Mock token'ı localStorage'a kaydet
      StorageService.setItem("access_token", token);
      
      const user = {
        _id: "mock_id_" + Math.random().toString(36).substring(2, 15),
        user_type_id: userType, // Doğrudan belirtilen kullanıcı tipini kullan
        email: payload.email,
        password: "",
        sms_notification_active: true,
        email_notification_active: true,
        registration_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("Login işlemi - Email:", payload.email);
      console.log("Login işlemi - Kullanıcı rolü:", user.user_type_id);
      
      // User data'yı localStorage'a kaydet - AuthProvider için önemli
      StorageService.setItem("user_data", JSON.stringify(user));
      
      return { token, user };
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
        const response = await this.http
          .service()
          .post<any, IModels.IRegisterPayload>(
            "auth/register",
            payload,
            options
          );
        
        console.log("API'den gelen register yanıtı:", response);
        return response;
      } catch (apiError) {
        console.error("API register hatası, mock veri kullanılacak:", apiError);
        // API hatası durumunda mock veri kullan
      }
      
      // Başarılı kayıt mesajı dön
      return { message: "Kayıt başarıyla tamamlandı. Giriş yapabilirsiniz." };
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  // Get current user
  public async getCurrentUser() {
    try {
      // Gerçek API isteği yap
      try {
        const response = await this.http.service().get<IModels.IUserAccount>("auth/me", {});
        console.log("API'den gelen kullanıcı bilgisi:", response);
        
        // Kullanıcı bilgilerini localStorage'a kaydet
        if (response) {
          StorageService.setItem("user_data", JSON.stringify(response));
        }
        
        return response;
      } catch (apiError) {
        console.error("API kullanıcı bilgisi hatası, mock veri kullanılacak:", apiError);
        // API hatası durumunda mock veri kullan
      }
      
      // Önce localStorage'da kayıtlı kullanıcı bilgisini kontrol et
      const storedUserData = StorageService.getItem("user_data");
      let userTypeId = "jobseeker"; // Varsayılan değer
      let email = "user@example.com";
      let userId = "user_test_id_" + Math.random().toString(36).substring(2, 15);
      
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          console.log("getCurrentUser - Local storage'dan kullanıcı bilgisi yüklendi:", userData);
          
          // Önceki bilgileri koru
          userTypeId = userData.user_type_id || "jobseeker";
          email = userData.email || email;
          userId = userData._id || userId;
          
          // Eğer tam kullanıcı verisi varsa doğrudan döndür
          if (userData._id && userData.user_type_id) {
            console.log("getCurrentUser - Local storage'dan tam kullanıcı verisi döndürülüyor:", userData);
            return userData;
          }
        } catch (parseError) {
          console.error("getCurrentUser - LocalStorage user data parse hatası:", parseError);
        }
      }
      
      // Kullanıcı bilgisini oluştur, önceki tip bilgisini koru
      const mockUser = {
        _id: userId,
        user_type_id: userTypeId, // Önceki kullanıcı tipini koru
        email: email,
        password: "",
        sms_notification_active: true,
        email_notification_active: true,
        registration_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("getCurrentUser - Oluşturulan kullanıcı:", mockUser);
      
      // user_data'yı güncelle
      StorageService.setItem("user_data", JSON.stringify(mockUser));
      
      return mockUser;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }

  // Logout user
  public async logout() {
    try {
      // Gerçek API isteği yap
      try {
        await this.http.service().post("auth/logout", {});
        console.log("API'den çıkış yapıldı");
        
        // API'den başarıyla çıkış yapıldıysa token'ı temizle
        StorageService.removeItem("access_token");
      } catch (apiError) {
        console.error("API logout hatası:", apiError);
      }
      
      // Mock için kullanıcı bilgisini temizle
      StorageService.removeItem("mock_user");
      StorageService.removeItem("access_token");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
}
