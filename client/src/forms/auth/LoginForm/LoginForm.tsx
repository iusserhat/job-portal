import { EyeIcon } from "@heroicons/react/24/outline";
import useLoginForm from "./useLoginForm";
import FieldError from "@/components/core-ui/FieldError";
import Alert from "@/components/core-ui/Alert";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const LoginForm = () => {
  const { form, loginError, loginRoleMismatch, handleUserTypeChange } = useLoginForm();
  
  // Form güncellendiğinde konsola yazdır (debug amaçlı)
  useEffect(() => {
    console.log("Güncel form değerleri:", form.values);
  }, [form.values]);

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6" noValidate>
      {loginError && (
        <div className="mb-4">
          <Alert type="error" message={loginError} />
        </div>
      )}
      {loginRoleMismatch && (
        <div className="mb-4">
          <Alert type="error" message={loginRoleMismatch} />
        </div>
      )}
      <div className="mb-6">
        <label
          htmlFor="user_type_id"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Hesap Türü
          <span className="text-red-500">*</span>
        </label>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div
            className={`flex items-center justify-center rounded-md border ${
              form.values.user_type_id === "hr_recruiter"
                ? "bg-indigo-50 border-indigo-600"
                : "border-gray-300"
            } px-3 py-3 text-sm font-medium leading-4 hover:bg-gray-50 cursor-pointer`}
            onClick={() => handleUserTypeChange("hr_recruiter")}
          >
            <span className={form.values.user_type_id === "hr_recruiter" ? "text-indigo-700" : "text-gray-900"}>
              İşveren
            </span>
          </div>
          <div
            className={`flex items-center justify-center rounded-md border ${
              form.values.user_type_id === "job_seeker"
                ? "bg-indigo-50 border-indigo-600"
                : "border-gray-300"
            } px-3 py-3 text-sm font-medium leading-4 hover:bg-gray-50 cursor-pointer`}
            onClick={() => handleUserTypeChange("job_seeker")}
          >
            <span className={form.values.user_type_id === "job_seeker" ? "text-indigo-700" : "text-gray-900"}>
              İş Arayan
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {form.values.user_type_id === "hr_recruiter" 
            ? "İş ilanı yayınlamak ve başvuruları yönetmek için işveren girişi yapın."
            : "İş aramak ve başvurularınızı yönetmek için iş arayan girişi yapın."}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Not: Hangi rol ile kayıt olduysanız o rol ile giriş yapmanız gereklidir.
        </p>
        {form.errors.user_type_id && (
          <FieldError error={form.errors.user_type_id} />
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          E-posta Adresi
          <span className="text-red-500">*</span>
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={form.values.email}
            disabled={form.isSubmitting}
            onChange={form.handleChange}
          />
          {form.errors.email && <FieldError error={form.errors.email} />}
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Şifre
          <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={form.values.password}
            disabled={form.isSubmitting}
            onChange={form.handleChange}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <EyeIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        {form.errors.password && <FieldError error={form.errors.password} />}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label
            htmlFor="remember-me"
            className="ml-3 block text-sm leading-6 text-gray-700"
          >
            Beni hatırla
          </label>
        </div>

        <div className="text-sm leading-6">
          <Link
            to="#"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Şifremi unuttum
          </Link>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          disabled={form.isSubmitting}
        >
          {form.isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </div>
      
      {/* Debug bilgisi */}
      <div className="mt-4 text-xs text-gray-400">
        <p>Seçilen hesap türü: {form.values.user_type_id}</p>
      </div>
    </form>
  );
};

export default LoginForm;
