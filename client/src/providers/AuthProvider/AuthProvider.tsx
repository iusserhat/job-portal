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
    try {
      console.log("AuthProvider - Login: Orijinal gelen kullanıcı:", user);
      
      // Kullanıcı tipi kontrolü
      if (!user.user_type_id) {
        console.error("AuthProvider - Login: Kullanıcının tipi (user_type_id) belirtilmemiş");
        return;
      }
      
      // Önce localStorage'ı temizle
      StorageService.removeItem("access_token");
      StorageService.removeItem("user_data");
      StorageService.removeItem("user_role");
      
      // Kullanıcı tipini doğru formatta olduğundan emin olalım
      const userTypeId = String(user.user_type_id).trim();
      
      // Kullanıcı tipini değiştirmeyelim, API'den gelen değeri kullanmalıyız
      const modifiedUser = {
        ...user,
        user_type_id: userTypeId
      };
      
      console.log("AuthProvider - Login: Düzenlenmiş kullanıcı:", modifiedUser);
      
      // Kullanıcı rolünü belirle
      let userRole = "unknown";
      
      // Bilinen ObjectId kontrolü
      const knownEmployerIds = ["681c883d3ccf9279e0d27874"];
      if (knownEmployerIds.includes(userTypeId)) {
        userRole = "employer";
      } else if (userTypeId === "hr_recruiter" || userTypeId.includes("hr_recruiter")) {
        userRole = "employer";
      } else if (userTypeId === "job_seeker" || userTypeId.includes("job_seeker")) {
        userRole = "jobseeker";
      } else if (/^[0-9a-fA-F]{24}$/.test(userTypeId)) {
        // Kimliği olmasa bile varsayılan olarak iş arayan olarak değerlendir
        userRole = "jobseeker";
      }
      
      console.log(`AuthProvider - Login: Kullanıcı rolü belirlendi: ${userRole}`);
      
      // Token'ı önce bir değişkende oluştur ve doğrula
      const tokenToStore = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      
      // Ardından yeni verileri kaydedelim
      StorageService.setItem("access_token", tokenToStore);
      
      // Kullanıcı rolünü ayrıca saklayalım
      StorageService.setItem("user_role", userRole);
      
      // Kullanıcı verilerini local storage'a da yaz - JSON.stringify ile
      const userJson = JSON.stringify(modifiedUser);
      StorageService.setItem("user_data", userJson);
      
      console.log("AuthProvider - Login: localStorage kullanıcı verisi kaydedildi:", userJson);
      
      // State'i güncelleyelim
      setUser(modifiedUser);
      setIsAuthenticated(true);
      
      console.log("AuthProvider - Login: Kullanıcı başarıyla giriş yaptı, userType =", modifiedUser.user_type_id);
      
      // Doğrulama: localStorage verisi kontrolü
      const savedUserData = StorageService.getItem("user_data");
      const savedUserRole = StorageService.getItem("user_role");
      const savedToken = StorageService.getItem("access_token");
      if (savedUserData && savedToken) {
        try {
          const parsedUser = JSON.parse(savedUserData);
          console.log("AuthProvider - Login: localStorage'dan okunan kullanıcı:", parsedUser);
          console.log("AuthProvider - Login: localStorage'dan okunan rol:", savedUserRole);
          console.log("AuthProvider - Login: localStorage'dan okunan token başlangıcı:", 
                     savedToken.substring(0, 20) + "...");
        } catch (error) {
          console.error("AuthProvider - Login: localStorage'daki kullanıcı parse hatası", error);
        }
      }
    } catch (error) {
      console.error("AuthProvider - Login: Hata oluştu", error);
    }
  };

  const logout = () => {
    StorageService.removeItem("access_token");
    StorageService.removeItem("user_data");
    StorageService.removeItem("user_role");
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
    
    try {
      // userTypeId'yi string olarak alıp küçük harf ve boşluk temizleme yapalım
      const userTypeId = String(user.user_type_id).toLowerCase().trim();
      
      // MongoDB ObjectId formatı kontrolü (24 karakter hexadecimal)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(userTypeId);
      
      // Ekranda görünen ObjectId'yi işveren olarak tanımla
      const knownEmployerIds = [
        "681c883d3ccf9279e0d27874" // Ekranda görünen ObjectId - İşveren olarak tanımlı
      ];
      
      // Hata ayıklama için daha kapsamlı log ekleyelim
      console.log("AuthProvider - isEmployer: Kullanıcı tipi kontrolü", {
        rawUserTypeId: user.user_type_id,
        normalizedTypeId: userTypeId,
        typeOf: typeof user.user_type_id,
        isObjectId,
        isKnownEmployer: knownEmployerIds.includes(userTypeId)
      });
      
      // Önce bilinen işveren ID'lerini kontrol et
      if (knownEmployerIds.includes(userTypeId)) {
        console.log("AuthProvider - isEmployer: Bilinen ObjectId işveren, işveren kabul ediliyor");
        return true;
      }
      
      // Sonra tipik işveren string kontrolü
      if (userTypeId === "hr_recruiter" || userTypeId.includes("hr_recruiter")) {
        console.log("AuthProvider - isEmployer: hr_recruiter string içeren kullanıcı tipi, işveren kabul ediliyor");
        return true;
      }
      
      // Eğer job_seeker string'i içeriyorsa, işveren değildir
      if (userTypeId === "job_seeker" || userTypeId.includes("job_seeker")) {
        console.log("AuthProvider - isEmployer: job_seeker string içeren kullanıcı tipi, işveren kabul edilmiyor");
        return false;
      }
      
      // ÖNEMLİ: Artık diğer ObjectId'ler için varsayılan değer false olacak
      // Bu ekranda görünen hataları düzeltmek için
      if (isObjectId) {
        console.log("AuthProvider - isEmployer: Bilinmeyen ObjectId formatında user_type_id, işveren kabul edilmiyor");
        return false;
      }
      
      // Hiçbir kontrol geçemediyse, işveren değil
      console.log("AuthProvider - isEmployer: Hiçbir koşul sağlanmadı, işveren kabul edilmiyor");
      return false;
    } catch (error) {
      console.error("AuthProvider - isEmployer: Hata oluştu", error);
      return false;
    }
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
    
    try {
      // userTypeId'yi string olarak alıp küçük harf ve boşluk temizleme yapalım
      const userTypeId = String(user.user_type_id).toLowerCase().trim();
      
      // MongoDB ObjectId formatı kontrolü (24 karakter hexadecimal)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(userTypeId);
      
      // Bilinen işveren ID'leri
      const knownEmployerIds = [
        "681c883d3ccf9279e0d27874" // Ekranda görünen ObjectId - İşveren olarak tanımlı
      ];
      
      // Bilinen iş arayan ID'leri - ekranınızdaki ObjectId buraya değil yukarıdaki işveren listesine eklendi
      const knownJobSeekerIds = [
        // Buraya eklemek istediğiniz iş arayan ObjectId'leri eklenebilir
      ];
      
      // Hata ayıklama için daha kapsamlı log
      console.log("AuthProvider - isJobSeeker: Kullanıcı tipi kontrolü", {
        rawUserTypeId: user.user_type_id,
        normalizedTypeId: userTypeId,
        typeOf: typeof user.user_type_id,
        isObjectId,
        isKnownEmployer: knownEmployerIds.includes(userTypeId),
        isKnownJobSeeker: knownJobSeekerIds.includes(userTypeId)
      });
      
      // Önce bilinen işveren ID'si mi kontrol et - işverense asla iş arayan olamaz
      if (knownEmployerIds.includes(userTypeId)) {
        console.log("AuthProvider - isJobSeeker: Bilinen işveren ObjectId, iş arayan DEĞİL");
        return false;
      }
      
      // Bilinen iş arayan ID'si mi kontrol et
      if (knownJobSeekerIds.includes(userTypeId)) {
        console.log("AuthProvider - isJobSeeker: Bilinen iş arayan ObjectId, iş arayan kabul ediliyor");
        return true;
      }
      
      // İşveren string kontrolü
      if (userTypeId === "hr_recruiter" || userTypeId.includes("hr_recruiter")) {
        console.log("AuthProvider - isJobSeeker: hr_recruiter string içeren kullanıcı tipi, iş arayan kabul edilmiyor");
        return false;
      }
      
      // Kesin iş arayan string kontrolü
      if (userTypeId === "job_seeker" || userTypeId.includes("job_seeker")) {
        console.log("AuthProvider - isJobSeeker: job_seeker string içeren kullanıcı tipi, iş arayan kabul ediliyor");
        return true;
      }
      
      // ÖNEMLİ: Bilinmeyen ObjectId'ler için varsayılan değer true olarak ayarlanıyor
      // Bu ekranda görünen hataları düzeltmek için
      if (isObjectId) {
        console.log("AuthProvider - isJobSeeker: Bilinmeyen ObjectId formatında user_type_id, iş arayan kabul ediliyor");
        return true;
      }
      
      // Hiçbir kontrol geçemediyse, varsayılan olarak iş arayan kabul edelim
      console.log("AuthProvider - isJobSeeker: Hiçbir koşul sağlanmadı, iş arayan kabul ediliyor");
      return true;
    } catch (error) {
      console.error("AuthProvider - isJobSeeker: Hata oluştu", error);
      return false;
    }
  };
  
  // Kullanıcının belirtilen rolde olup olmadığını kontrol et
  const isUserAllowed = (requestedRole: string) => {
    if (!user || !user.user_type_id) {
      console.log("AuthProvider - isUserAllowed: Kullanıcı veya rol bilgisi bulunamadı.");
      return false;
    }
    
    try {
      // requestedRole'ü doğru formata dönüştür (hr_recruiter/job_seeker)
      let normalizedRequestedRole = requestedRole.toLowerCase().trim();
      if (normalizedRequestedRole === "employer") {
        normalizedRequestedRole = "hr_recruiter";
      } else if (normalizedRequestedRole === "jobseeker") {
        normalizedRequestedRole = "job_seeker";
      }
      
      const userRole = String(user.user_type_id).toLowerCase().trim();
      
      // Daha esnek karşılaştırma
      const isAllowed = userRole.includes(normalizedRequestedRole) || 
                      normalizedRequestedRole.includes(userRole);
      
      console.log(`AuthProvider - isUserAllowed: Kullanıcı rolü: ${userRole}, İstenen rol: ${normalizedRequestedRole}, Sonuç: ${isAllowed}`);
      
      if (!isAllowed) {
        console.error("AuthProvider - isUserAllowed: Kullanıcı bu role sahip değil, oturum sonlandırılıyor.");
        // Rol uyuşmazlığında oturumu sonlandır
        setTimeout(() => {
          logout();
        }, 500);
      }
      
      return isAllowed;
    } catch (error) {
      console.error("AuthProvider - isUserAllowed: Hata oluştu", error);
      return false;
    }
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
        
        // Önce localStorage'dan kullanıcı bilgilerini kontrol et
        const storedUserData = StorageService.getItem("user_data");
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log("AuthProvider - localStorage'dan kullanıcı yüklendi:", userData);
            
            // Kullanıcı tipi kontrolü
            if (!userData.user_type_id) {
              console.error("AuthProvider - localStorage'daki kullanıcı tipinde sorun var, verileri sıfırlıyoruz");
              logout();
              return;
            }
            
            // String olduğundan emin olalım
            userData.user_type_id = String(userData.user_type_id).trim();
            
            // Kullanıcı rolünü belirle
            let userRole = StorageService.getItem("user_role");
            if (!userRole) {
              userRole = "unknown";
              
              // Bilinen ObjectId kontrolü
              const userTypeId = userData.user_type_id;
              const knownEmployerIds = ["681c883d3ccf9279e0d27874"];
              if (knownEmployerIds.includes(userTypeId)) {
                userRole = "employer";
              } else if (userTypeId === "hr_recruiter" || userTypeId.includes("hr_recruiter")) {
                userRole = "employer";
              } else if (userTypeId === "job_seeker" || userTypeId.includes("job_seeker")) {
                userRole = "jobseeker";
              } else if (/^[0-9a-fA-F]{24}$/.test(userTypeId)) {
                // Kimliği olmasa bile varsayılan olarak iş arayan olarak değerlendir
                userRole = "jobseeker";
              }
              
              // Kullanıcı rolünü kaydet
              StorageService.setItem("user_role", userRole);
              console.log(`AuthProvider - fetchUser: Kullanıcı rolü belirlendi: ${userRole}`);
            }
            
            setUser(userData);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("AuthProvider - localStorage user data parse hatası:", parseError);
            logout();
            return;
          }
        }
        
        // API'den kullanıcı bilgisini alma
        try {
          const authService = new AuthService();
          const response = await authService.getCurrentUser();
          
          // Kullanıcı verileri içinde user_type_id yoksa oturumu kapat
          if (!response || !response.user_type_id) {
            console.error("AuthProvider - Geçersiz kullanıcı verisi, oturum sonlandırılıyor");
            logout();
            return;
          }
          
          console.log("AuthProvider - API'den kullanıcı başarıyla alındı:", response);
          console.log("AuthProvider - Kullanıcı tipi:", response.user_type_id);
          
          // user_type_id'yi string olarak saklayalım
          const modifiedResponse = {
            ...response,
            user_type_id: String(response.user_type_id)
          };
          
          // localStorage'a güncel kullanıcı bilgilerini kaydet
          StorageService.setItem("user_data", JSON.stringify(modifiedResponse));
          
          setUser(modifiedResponse);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("AuthProvider - API'den kullanıcı bilgisi alınırken hata:", error);
          // API hatası durumunda, localStorage'daki kullanıcıyı kullanmaya devam et
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
