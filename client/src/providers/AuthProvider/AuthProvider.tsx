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
  setUserType: (type: string) => void;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUserAccount | null>(null);

  const login = (token: string, user: IUserAccount) => {
    console.log("AuthProvider - Login: Kullanıcı giriş yapıyor", user);
    
    // Kullanıcı tipini doğru şekilde ayarla
    const modifiedUser = {
      ...user,
      // Eğer tip belirtilmemişse varsayılan olarak iş arayan yapalım
      user_type_id: user.user_type_id || "jobseeker"
    };
    
    // Kullanıcı tipinin hem doğru olduğundan hem de string olduğundan emin olalım
    modifiedUser.user_type_id = String(modifiedUser.user_type_id).trim();
    
    console.log("AuthProvider - Login: Kullanıcı tipi:", modifiedUser.user_type_id);
    
    // Test için kullanıcı tipini zorlamayı kaldırdık - kullanıcı gerçek tipini koruyacak
    // modifiedUser.user_type_id = "employer";
    // console.log("AuthProvider - Login: Kullanıcı tipi zorla güncellendi:", modifiedUser.user_type_id);
    
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
    const result = userTypeId === "employer";
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
    const result = userTypeId === "jobseeker";
    console.log(`AuthProvider - isJobSeeker: user_type_id = ${userTypeId}, sonuç = ${result}`);
    
    return result;
  };
  
  // Kullanıcı tipini değiştir
  const setUserType = (type: string) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      user_type_id: type
    };
    
    setUser(updatedUser);
    
    // LocalStorage'ı da güncelle
    StorageService.setItem("user_data", JSON.stringify(updatedUser));
    console.log("AuthProvider - setUserType: Kullanıcı tipi değiştirildi:", type);
  };

  // Check if user is already authenticated on mount
  useEffect(() => {
    if (user) {
      console.log("AuthProvider - useEffect: Kullanıcı zaten var, işlem yapılmıyor");
      return;
    }

    const fetchUser = async () => {
      try {
        console.log("AuthProvider - Kullanıcı bilgileri kontrol ediliyor");
        const token = StorageService.getItem("access_token");
        
        // Önce localStorage'dan kullanıcı bilgisini kontrol et
        const storedUserData = StorageService.getItem("user_data");
        
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log("AuthProvider - Local storage'dan kullanıcı yüklendi:", userData);
            console.log("AuthProvider - Kullanıcı tipi:", userData.user_type_id);
            
            // Kullanıcı tipini koruyalım (değiştirmeyelim)
            setUser(userData);
            setIsAuthenticated(true);
            return;
          } catch (parseError) {
            console.error("LocalStorage user data parse hatası:", parseError);
          }
        }
        
        if (token) {
          console.log("AuthProvider - Token bulundu, kullanıcı bilgileri alınıyor");
          const authService = new AuthService();
          const response = await authService.getCurrentUser();
          console.log("AuthProvider - Kullanıcı başarıyla alındı:", response);
          console.log("AuthProvider - Kullanıcı tipi:", response.user_type_id);
          
          // Storage'a kaydet
          StorageService.setItem("user_data", JSON.stringify(response));
          
          setUser(response);
          setIsAuthenticated(true);
        } else {
          console.log("AuthProvider - Token bulunamadı, oturum açılmamış");
        }
      } catch (error) {
        console.error("AuthProvider - Kullanıcı bilgisi alınırken hata:", error);
        setIsAuthenticated(false);
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
      setUserType 
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
