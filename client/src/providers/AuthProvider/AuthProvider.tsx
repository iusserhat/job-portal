import StorageService from "@/core/storage.service";
import { IUserAccount } from "@/interfaces/models";
import AuthService from "@/services/auth.service";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextProps = {
  isAuthenticated: boolean;
  user: IUserAccount | null;
  login: (token: string, user: IUserAccount) => void;
  logout: () => void;
  isEmployer: () => boolean;
  isJobSeeker: () => boolean;
  isUserAllowed: (requestedRole: string) => boolean;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUserAccount | null>(null);

  const login = (token: string, user: IUserAccount) => {
    console.log("AuthProvider - Login: Kullanıcı giriş yapıyor", user);
    
    // Kullanıcı tipi kontrolü
    if (!user.user_type_id) {
      console.error("AuthProvider - Login: Kullanıcının tipi (user_type_id) belirtilmemiş");
      return;
    }
    
    // Kullanıcı tipini doğru formatta olduğundan emin olalım
    const userTypeId = String(user.user_type_id).trim();
    
    // Kullanıcı tipini değiştirmeyelim, API'den gelen değeri kullanmalıyız
    const modifiedUser = {
      ...user,
      user_type_id: userTypeId
    };
    
    console.log("AuthProvider - Login: Kullanıcı tipi:", modifiedUser.user_type_id);
    
    StorageService.setItem("access_token", token);
    // Kullanıcı verilerini local storage'a da yaz
    StorageService.setItem("user_data", JSON.stringify(modifiedUser));
    
    setUser(modifiedUser);
    setIsAuthenticated(true);
    console.log("AuthProvider - Login: Kullanıcı başarıyla giriş yaptı, userType =", modifiedUser.user_type_id);
  };

  const logout = () => {
    StorageService.removeItem("access_token");
    StorageService.removeItem("user_data");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Kullanıcının işveren olup olmadığını kontrol et
  const isEmployer = () => {
    if (!user) {
      console.log("AuthProvider - isEmployer: kullanıcı bulunamadı, false döndürülüyor");
      return false;
    }
    
    // Kullanıcı tipi kontrolünü güçlendirelim
    if (!user.user_type_id) {
      console.log("AuthProvider - isEmployer: user_type_id bulunamadı, false döndürülüyor");
      return false;
    }
    
    const userTypeId = String(user.user_type_id).toLowerCase().trim();
    const result = userTypeId === "hr_recruiter";
    console.log(`AuthProvider - isEmployer: user_type_id = ${userTypeId}, sonuç = ${result}`);
    
    return result;
  };
  
  // Kullanıcının iş arayan olup olmadığını kontrol et
  const isJobSeeker = () => {
    if (!user) {
      console.log("AuthProvider - isJobSeeker: kullanıcı bulunamadı, false döndürülüyor");
      return false;
    }
    
    // Kullanıcı tipi kontrolünü güçlendirelim
    if (!user.user_type_id) {
      console.log("AuthProvider - isJobSeeker: user_type_id bulunamadı, false döndürülüyor");
      return false;
    }
    
    const userTypeId = String(user.user_type_id).toLowerCase().trim();
    const result = userTypeId === "job_seeker";
    console.log(`AuthProvider - isJobSeeker: user_type_id = ${userTypeId}, sonuç = ${result}`);
    
    return result;
  };
  
  // Kullanıcının belirtilen rolde olup olmadığını kontrol et
  const isUserAllowed = (requestedRole: string) => {
    if (!user || !user.user_type_id) {
      console.log("AuthProvider - isUserAllowed: Kullanıcı veya rol bilgisi bulunamadı.");
      return false;
    }
    
    // requestedRole'ü doğru formata dönüştür (hr_recruiter/job_seeker)
    let normalizedRequestedRole = requestedRole.toLowerCase().trim();
    if (normalizedRequestedRole === "employer") {
      normalizedRequestedRole = "hr_recruiter";
    } else if (normalizedRequestedRole === "jobseeker") {
      normalizedRequestedRole = "job_seeker";
    }
    
    const userRole = String(user.user_type_id).toLowerCase().trim();
    
    const isAllowed = userRole === normalizedRequestedRole;
    
    console.log(`AuthProvider - isUserAllowed: Kullanıcı rolü: ${userRole}, İstenen rol: ${normalizedRequestedRole}, Sonuç: ${isAllowed}`);
    
    if (!isAllowed) {
      console.error("AuthProvider - isUserAllowed: Kullanıcı bu role sahip değil, oturum sonlandırılıyor.");
      // Rol uyuşmazlığında oturumu sonlandır
      setTimeout(() => {
        logout();
      }, 500);
    }
    
    return isAllowed;
  };

  // Check if user is already authenticated on mount
  useEffect(() => {
    // Kullanıcı zaten yüklendiyse tekrar yükleme
    if (user) {
      console.log("AuthProvider - useEffect: Kullanıcı zaten var, işlem yapılmıyor");
      return;
    }

    const fetchUser = async () => {
      try {
        console.log("AuthProvider - Kullanıcı bilgileri kontrol ediliyor");
        const token = StorageService.getItem("access_token");
        
        if (!token) {
          console.log("AuthProvider - Token bulunamadı, oturum açılmamış");
          setIsAuthenticated(false);
          setUser(null);
          return;
        }
        
        // Sadece token varsa API isteği yap
        try {
          const authService = new AuthService();
          const response = await authService.getCurrentUser();
          
          // Kullanıcı verileri içinde user_type_id yoksa oturumu kapat
          if (!response || !response.user_type_id) {
            console.error("AuthProvider - Geçersiz kullanıcı verisi, oturum sonlandırılıyor");
            logout();
            return;
          }
          
          console.log("AuthProvider - Kullanıcı başarıyla alındı:", response);
          console.log("AuthProvider - Kullanıcı tipi:", response.user_type_id);
          
          setUser(response);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("AuthProvider - Kullanıcı bilgisi alınırken hata:", error);
          // Hata durumunda oturumu kapat
          logout();
        }
      } catch (error) {
        console.error("AuthProvider - Genel hata:", error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    fetchUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      isEmployer, 
      isJobSeeker,
      isUserAllowed
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
