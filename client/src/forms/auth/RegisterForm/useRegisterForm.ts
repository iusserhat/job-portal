import { IRegisterPayload } from "@/interfaces/models";
import useAuthStore from "@/stores/auth.store";
import { useFormik } from "formik";
import { useEffect } from "react";
import * as Yup from "yup";

const FORM_INITIAL_VALUES = {
  user_type_name: "job_seeker",
  email: "",
  password: "",
  confirmPassword: "",
  termsConditions: false,
};

const useRegisterForm = () => {
  const {
    registerSuccessMessage,
    registerErrorMessage,
    termsConditionsModalOpen,
    setTermsConditionsModalOpen,
    register,
    clearRegisterMessages,
  } = useAuthStore((state) => ({
    registerSuccessMessage: state.registerSuccessMessage,
    registerErrorMessage: state.registerErrorMessage,
    termsConditionsModalOpen: state.termsConditionsModalOpen,
    setTermsConditionsModalOpen: state.setTermsConditionsModalOpen,
    register: state.register,
    clearRegisterMessages: state.clearRegisterMessages,
  }));

  const validationSchema = Yup.object({
    user_type_name: Yup.string()
      .required("Hesap türü seçimi zorunludur")
      .oneOf(["job_seeker", "hr_recruiter"], "Geçerli bir hesap türü seçmelisiniz"),
    email: Yup.string()
      .required("E-posta adresi zorunludur")
      .email("Geçerli bir e-posta adresi giriniz"),
    password: Yup.string()
      .required("Şifre zorunludur")
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .max(20, "Şifre en fazla 20 karakter olmalıdır"),
    confirmPassword: Yup.string()
      .required("Şifre tekrarı zorunludur")
      .oneOf([Yup.ref("password")], "Şifreler eşleşmiyor"),
    termsConditions: Yup.boolean().oneOf(
      [true],
      "Kullanım şartlarını kabul etmelisiniz"
    ),
  });

  const form = useFormik({
    initialValues: FORM_INITIAL_VALUES,
    validationSchema: validationSchema,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const payload: IRegisterPayload = {
          user_type_name: values.user_type_name,
          email: values.email,
          password: values.password,
        };
        
        console.log("Form değerleri:", values);
        console.log("Server'a gönderilen payload:", payload);
        
        await register(payload);
        form.resetForm();
      } catch (error) {
        console.error("Kayıt işlemi hatası:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleOnOpenTermsConditionsModal = () => {
    setTermsConditionsModalOpen(true);
  };

  const handleOnCloseTermsConditionsModal = () => {
    setTermsConditionsModalOpen(false);
  };

  useEffect(() => {
    return () => {
      clearRegisterMessages();
    };
  }, [clearRegisterMessages]);

  return {
    form,
    registerSuccessMessage,
    registerErrorMessage,
    termsConditionsModalOpen,
    handleOnOpenTermsConditionsModal,
    handleOnCloseTermsConditionsModal,
  };
};

export default useRegisterForm;
