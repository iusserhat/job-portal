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
    // Mock veri dönüşü için
    try {
      // NOT: Backend bağlantısını devre dışı bırakıp mock veriyi her zaman kullanıyoruz
      // if (import.meta.env.VITE_USE_MOCK !== 'true') {
      //   return this.http
      //     .service()
      //     .post<IModels.ILoginResponse, IModels.ILoginPayload>(
      //       "auth/login",
      //       payload,
      //       options
      //     );
      // }
      
      // Kullanıcı tipini email'e göre belirle
      const isEmployer = payload.email.includes('hr') || 
                         payload.email.includes('recruiter') || 
                         payload.email.includes('employer');
                         
      const userType = isEmployer ? "employer" : "jobseeker";
      
      const token = "mock_token_" + Math.random().toString(36).substring(2, 15);
      const user = {
        _id: "mock_id_" + Math.random().toString(36).substring(2, 15),
        user_type_id: userType, // Email'e göre kullanıcı tipi belirleme
        email: payload.email,
        password: "",
        sms_notification_active: true,
        email_notification_active: true,
        registration_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("Login işlemi - Email:", payload.email);
      console.log("Login işlemi - İşveren mi:", isEmployer);
      console.log("Login işlemi - Kullanıcı rolü:", user.user_type_id);
      
      // LocalStorage'a mock kullanıcıyı kaydet
      StorageService.setItem("mock_user", JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register user
  public async register(payload: IModels.IRegisterPayload, options?: any) {
    // Mock veri dönüşü
    try {
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
      // NOT: Backend bağlantısını devre dışı bırakıp mock veriyi her zaman kullanıyoruz
      // if (import.meta.env.VITE_USE_MOCK !== 'true') {
      //   return this.http.service().get<IModels.IUserAccount>("auth/me", {});
      // }
      
      // Mock veri
      const storedUser = StorageService.getItem("mock_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("Get current user - Kullanıcı rolü:", user.user_type_id);
        return user;
      }
      
      // Kullanıcı bulunamadıysa varsayılan iş arayan kullanıcısı oluştur
      const defaultUser = {
        _id: "default_user_id",
        user_type_id: "jobseeker", // Varsayılan olarak iş arayan
        email: "jobseeker@example.com",
        password: "",
        sms_notification_active: true,
        email_notification_active: true,
        registration_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("Default kullanıcı oluşturuldu - Kullanıcı rolü:", defaultUser.user_type_id);
      
      // LocalStorage'a kaydet
      StorageService.setItem("mock_user", JSON.stringify(defaultUser));
      
      return defaultUser;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }

  // Logout user
  public async logout() {
    // Mock için kullanıcı bilgisini temizle
    StorageService.removeItem("mock_user");
  }
}
