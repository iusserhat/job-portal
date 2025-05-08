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
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUserAccount | null>(null);

  const login = (token: string, user: IUserAccount) => {
    console.log("AuthProvider - Login: Kullanıcı giriş yapıyor", user);
    StorageService.setItem("access_token", token);
    setUser(user);
    setIsAuthenticated(true);
    console.log("AuthProvider - Login: Kullanıcı başarıyla giriş yaptı, isEmployer =", user.user_type_id === "employer");
  };

  const logout = () => {
    StorageService.removeItem("access_token");
    setIsAuthenticated(false);
  };

  const isEmployer = () => {
    if (!user) {
      console.log("AuthProvider - isEmployer: kullanıcı bulunamadı, false döndürülüyor");
      return false;
    }
    const result = user.user_type_id === "employer";
    console.log("AuthProvider - isEmployer: user_type_id =", user.user_type_id, "result =", result);
    return result;
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
        if (token) {
          console.log("AuthProvider - Token bulundu, kullanıcı bilgileri alınıyor");
          const authService = new AuthService();
          const response = await authService.getCurrentUser();
          console.log("AuthProvider - Kullanıcı başarıyla alındı:", response);
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isEmployer }}>
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
