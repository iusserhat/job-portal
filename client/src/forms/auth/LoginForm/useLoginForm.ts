import { ILoginPayload } from "@/interfaces/models";
import { useAuth } from "@/providers";
import useAuthStore from "@/stores/auth.store";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

const FORM_INITIAL_VALUES = {
  email: "",
  password: "",
  user_type_id: "hr_recruiter",
};

const useLoginForm = () => {
  const { login: setLogin } = useAuth();
  const navigate = useNavigate();
  const [loginRoleMismatch, setLoginRoleMismatch] = useState<string>("");
  const { loginError, login, clearLoginError } = useAuthStore((state) => ({
    login: state.login,
    loginError: state.loginError,
    clearLoginError: state.clearLoginError,
  }));

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Email adresi gereklidir")
      .email("Geçerli bir email adresi giriniz"),
    password: Yup.string()
      .required("Şifre gereklidir")
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .max(20, "Şifre en fazla 20 karakter olmalıdır"),
    user_type_id: Yup.string()
      .required("Kullanıcı tipi seçimi zorunludur")
      .oneOf(["job_seeker", "hr_recruiter"], "Geçerli bir kullanıcı tipi seçmelisiniz"),
  });

  const form = useFormik({
    initialValues: FORM_INITIAL_VALUES,
    validationSchema: validationSchema,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        setLoginRoleMismatch("");

        console.log("Login form values:", values);
        
        // Login için gerekli verileri hazırla
        const loginPayload: ILoginPayload = {
          email: values.email,
          password: values.password,
          user_type_id: values.user_type_id  // Kullanıcı tipini string olarak gönder
        };
        
        console.log("Login payloadı gönderiliyor:", loginPayload);
        
        try {
          // Login isteği yap
          const response = await login(loginPayload);
          console.log("Login başarılı:", response);
          
          // Giriş başarılı, kullanıcıyı anasayfaya yönlendir
          setLogin(response.token, response.user);
          navigate("/");
        } catch (error: any) {
          console.error("Login hatası:", error);
          
          // Hata mesajını konsola yazdır
          if (error.response) {
            console.error("Sunucu yanıtı:", error.response.data);
          }
          
          if (error.message) {
            // Rol uyuşmazlığı hatası
            if (error.message.includes("rolü ile giriş yapamaz")) {
              setLoginRoleMismatch(error.message);
            }
            // Diğer 401 hataları
            else if (error.message.includes("Giriş yapılamadı") || 
                     error.message.includes("Unauthorized") ||
                     error.message.includes("belirtilen rol") ||
                     error.message.includes("Kullanıcı bulunamadı") ||
                     error.message.includes("Geçersiz e-posta veya şifre")) {
              setLoginRoleMismatch("Bu e-posta adresi ve şifre ile giriş yapılamadı. E-posta/şifre kontrolü yapın veya farklı hesap tipi seçin.");
            }
            // Genel hatalar
            else {
              setLoginRoleMismatch(error.message || "Giriş yapılırken bir hata oluştu.");
            }
          } else {
            setLoginRoleMismatch("Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleUserTypeChange = (value: string) => {
    setLoginRoleMismatch("");
    form.setFieldValue("user_type_id", value);
  };

  useEffect(() => {
    // Reset user type mismatch error when user type changes
    return () => {
      clearLoginError();
    };
  }, [clearLoginError]);

  return {
    form,
    loginError,
    loginRoleMismatch,
    handleUserTypeChange,
  };
};

export default useLoginForm;
