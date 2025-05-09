import { ILoginPayload } from "@/interfaces/models";
import { useAuth } from "@/providers";
import useAuthStore from "@/stores/auth.store";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

const FORM_INITIAL_VALUES = {
  email: "",
  password: "",
  user_type_id: "jobseeker",
};

const useLoginForm = () => {
  const { login: setLogin } = useAuth();
  const navigate = useNavigate();
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
      .oneOf(["employer", "jobseeker"], "Geçerli bir kullanıcı tipi seçmelisiniz"),
  });

  const form = useFormik({
    initialValues: FORM_INITIAL_VALUES,
    validationSchema: validationSchema,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const payload: ILoginPayload = {
          email: values.email,
          password: values.password,
          user_type_id: values.user_type_id
        };
        console.log("Login girişi:", payload);
        const { token, user } = await login(payload);
        setLogin(token, user);
        form.resetForm();
        navigate("/");
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    return () => {
      clearLoginError();
    };
  }, [clearLoginError]);

  return {
    form,
    loginError,
  };
};

export default useLoginForm;
