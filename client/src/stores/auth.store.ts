import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { IStores } from "@/interfaces";
import AuthService from "@/services/auth.service";

const initialState = {
  termsConditionsModalOpen: false,
  setTermsConditionsModalOpen: () => {},

  isLogging: false,
  loginError: "",
  login: () => {},
  clearLoginError: () => {},

  registerSuccessMessage: "",
  registerErrorMessage: "",
  register: () => {},
  clearRegisterMessages: () => {},
};

const useAuthStore = create<IStores.IAuthStore>((set) => ({
  ...initialState,

  // This functions will be used to open and close the terms and conditions modal
  setTermsConditionsModalOpen: (value) => {
    set({ termsConditionsModalOpen: value });
  },

  // This function is used to call the login endpoint
  login: async (payload, options) => {
    set({ isLogging: true });
    set({ loginError: "" });
    
    try {
      console.log("auth.store - login başlatılıyor, payload:", payload);
      
      const authService = new AuthService();
      const response = await authService.login(payload, options);
      
      console.log("auth.store - login başarılı:", response);
      set({ isLogging: false });
      
      return response;
    } catch (error: any) {
      console.error("auth.store - login hatası:", error);
      set({ isLogging: false });
      
      let errorMessage = "Giriş yapılırken bir hata oluştu";
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
        console.error("auth.store - sunucu hata mesajı:", errorMessage);
      } else if (error.message) {
        errorMessage = error.message;
        console.error("auth.store - hata mesajı:", errorMessage);
      }
      
      set({ loginError: errorMessage });
      throw error;
    }
  },

  // This function is used to call the register endpoint
  register: async (payload, options) => {
    set({ registerSuccessMessage: "" });
    set({ registerErrorMessage: "" });
    try {
      const authService = new AuthService();
      const response = await authService.register(payload, options);
      set({ registerSuccessMessage: response.message });
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        set({ registerErrorMessage: error.response.data.message });
      }
      throw error;
    }
  },

  // This function is used to clear the login error message
  clearLoginError: () => {
    set({ loginError: "" });
  },

  // This function is used to clear the register success and error messages
  clearRegisterMessages: () => {
    set({ registerSuccessMessage: "" });
    set({ registerErrorMessage: "" });
  },
}));

export default useAuthStore;

if (import.meta.env.VITE_USER_NODE_ENV === "development") {
  mountStoreDevtool("AuthStore", useAuthStore);
}
