import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { toast } from "react-hot-toast";

// İlan oluşturma formu için doğrulama şeması
const validationSchema = Yup.object().shape({
  job_title: Yup.string().required("İş başlığı zorunludur"),
  company_name: Yup.string().required("Şirket adı zorunludur"),
  location_name: Yup.string().required("Konum zorunludur"),
  job_description: Yup.string().required("İş açıklaması zorunludur").min(50, "İş açıklaması en az 50 karakter olmalıdır"),
  salary_range: Yup.string(),
  required_skills: Yup.string(),
  is_active: Yup.boolean().default(true)
});

// İlan oluşturma formu için başlangıç değerleri
const initialValues = {
  job_title: "",
  company_name: "",
  location_name: "Bandırma",
  job_description: "",
  salary_range: "",
  required_skills: "",
  is_active: true
};

const PostJobPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form gönderimi
  const handleSubmit = async (values: any, { resetForm }: any) => {
    setIsSubmitting(true);
    
    try {
      console.log("PostJobPage - İş ilanı oluşturuluyor:", values);
      
      // Required skills'i diziye çevir
      let requiredSkills = [];
      if (values.required_skills) {
        requiredSkills = values.required_skills
          .split(",")
          .map((skill: string) => skill.trim())
          .filter((skill: string) => skill.length > 0);
      }
      
      // API'ye gönderilecek veri
      const jobData = {
        ...values,
        required_skills: requiredSkills
      };
      
      // Doğrudan API'ye istek gönder
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/direct-jobs`;
      
      console.log("API isteği gönderiliyor:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(jobData)
      });
      
      // API yanıtını kontrol et
      if (!response.ok) {
        let errorMessage = `Hata: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // JSON parse hatası durumunda orijinal hata mesajını kullan
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("API yanıtı:", data);
      
      // Başarılı ilan oluşturma
      toast.success("İş ilanı başarıyla oluşturuldu!");
      resetForm();
      
      // İlanlarım sayfasına yönlendir
      setTimeout(() => {
        navigate("/my-jobs");
      }, 1500);
    } catch (error) {
      console.error("İş ilanı oluşturulurken hata:", error);
      toast.error(error instanceof Error ? error.message : "İş ilanı oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout title="Yeni İş İlanı Oluştur">
      <div className="mx-auto max-w-3xl py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni İş İlanı Oluştur</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isValid }) => (
              <Form className="space-y-6">
                {/* İş Başlığı */}
                <div>
                  <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
                    İş Başlığı *
                  </label>
                  <Field
                    type="text"
                    name="job_title"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.job_title && touched.job_title ? "border-red-500" : ""
                    }`}
                    placeholder="Örn: Yazılım Geliştirici"
                  />
                  <ErrorMessage name="job_title" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Şirket Adı */}
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                    Şirket Adı *
                  </label>
                  <Field
                    type="text"
                    name="company_name"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.company_name && touched.company_name ? "border-red-500" : ""
                    }`}
                    placeholder="Örn: ABC Teknoloji A.Ş."
                  />
                  <ErrorMessage name="company_name" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Konum */}
                <div>
                  <label htmlFor="location_name" className="block text-sm font-medium text-gray-700">
                    Konum *
                  </label>
                  <Field
                    type="text"
                    name="location_name"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.location_name && touched.location_name ? "border-red-500" : ""
                    }`}
                    placeholder="Örn: Bandırma, Balıkesir"
                  />
                  <ErrorMessage name="location_name" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Maaş Aralığı */}
                <div>
                  <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">
                    Maaş Aralığı
                  </label>
                  <Field
                    type="text"
                    name="salary_range"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Örn: 20,000TL - 30,000TL"
                  />
                  <ErrorMessage name="salary_range" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Aranan Yetenekler */}
                <div>
                  <label htmlFor="required_skills" className="block text-sm font-medium text-gray-700">
                    Aranan Yetenekler (virgülle ayırın)
                  </label>
                  <Field
                    type="text"
                    name="required_skills"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Örn: React, TypeScript, Node.js"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Aranan yetenekleri virgülle ayırarak yazın
                  </p>
                </div>
                
                {/* İş Açıklaması */}
                <div>
                  <label htmlFor="job_description" className="block text-sm font-medium text-gray-700">
                    İş Açıklaması *
                  </label>
                  <Field
                    as="textarea"
                    name="job_description"
                    rows={6}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.job_description && touched.job_description ? "border-red-500" : ""
                    }`}
                    placeholder="İş pozisyonu, sorumluluklar ve gereksinimler hakkında detaylı bilgi yazın..."
                  />
                  <ErrorMessage name="job_description" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* İlan Aktif Mi? */}
                <div className="flex items-center">
                  <Field
                    type="checkbox"
                    name="is_active"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">
                    İlanı hemen yayınla
                  </label>
                </div>
                
                {/* Gönder Butonu */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm ${
                      isSubmitting || !isValid
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    }`}
                  >
                    {isSubmitting ? "Kaydediliyor..." : "İlanı Oluştur"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </PortalLayout>
  );
};

export default PostJobPage; 