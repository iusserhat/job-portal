import { useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { toast } from "react-hot-toast";

// İş ilanı için tip tanımlaması
interface JobPosting {
  id: number;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  createdAt: string;
  salary: string;
  requiredSkills: string[];
  description: string;
  isActive: boolean;
  applicantsCount: number;
}

const PostJobPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  // Bandırma'nın mahalleleri
  const bandirmaLocations = [
    "Merkez", 
    "Edincik", 
    "Erdek", 
    "Gönen", 
    "Manyas", 
    "Marmara", 
    "Savaştepe", 
    "Susurluk",
    "Diğer"
  ];

  // İş türleri
  const jobTypes = [
    "Tam Zamanlı", 
    "Yarı Zamanlı", 
    "Uzaktan", 
    "Stajyer", 
    "Proje Bazlı"
  ];

  // Form validasyon şeması
  const validationSchema = Yup.object({
    jobTitle: Yup.string().required("İş başlığı zorunludur"),
    companyName: Yup.string().required("Şirket adı zorunludur"),
    location: Yup.string().required("Konum seçimi zorunludur"),
    jobType: Yup.string().required("İş türü zorunludur"),
    salary: Yup.string(),
    jobDescription: Yup.string().required("İş açıklaması zorunludur").min(50, "En az 50 karakter olmalıdır"),
    requiredSkills: Yup.string().required("Gerekli yetenekler zorunludur"),
    contactEmail: Yup.string().email("Geçerli bir e-posta adresi girin").required("İletişim e-postası zorunludur"),
    contactPhone: Yup.string(),
    applicationDeadline: Yup.date().min(new Date(), "Geçmiş tarih seçilemez")
  });

  // Form gönderimi
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    
    try {
      console.log("Yeni iş ilanı oluşturuluyor:", values);
      
      const token = localStorage.getItem('access_token');
      console.log("Token durumu:", token ? "Token var" : "Token yok");
      
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/jobs`;
      console.log("API isteği gönderiliyor:", apiUrl);
      
      // API isteği için verileri hazırla
      const jobData = {
        job_type_id: "507f1f77bcf86cd799439011", // Geçerli bir MongoDB ObjectId
        company_id: "507f1f77bcf86cd799439012", // Geçerli bir MongoDB ObjectId
        is_company_name_hidden: false,
        job_description: values.jobDescription,
        job_title: values.jobTitle,
        job_location_id: "507f1f77bcf86cd799439013", // Geçerli bir MongoDB ObjectId
        location_name: values.location,
        company_name: values.companyName,
        salary_range: values.salary,
        required_skills: values.requiredSkills.split(',').map(skill => skill.trim()),
        contact_email: values.contactEmail,
        contact_phone: values.contactPhone,
        application_deadline: values.applicationDeadline,
        is_active: true
      };
      
      console.log("Gönderilen veri:", jobData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '' // Token yoksa boş gönder
        },
        body: JSON.stringify(jobData)
      });
      
      let responseData;
      let responseText;
      
      try {
        responseText = await response.text();
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("API yanıtı JSON olarak ayrıştırılamadı:", responseText);
        responseData = { success: false, message: "Yanıt ayrıştırma hatası" };
      }
      
      if (!response.ok) {
        console.error(`API hatası (${response.status}):`, responseData);
        throw new Error(`API ile ilanı kaydederken bir hata oluştu: ${response.status} ${response.statusText}`);
      }
      
      console.log("API yanıtı:", responseData);
      
      // Set success state to show message
      setSubmitSuccess(true);
      
      // Başarı mesajı göster
      toast.success("İş ilanı başarıyla MongoDB'ye kaydedildi!");
      
      // Form'u sıfırla
      resetForm();
      
      // 2 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("İş ilanı oluşturma hatası:", error);
      toast.error("İş ilanı oluşturulurken bir hata oluştu: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout title="İş İlanı Oluştur">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni İş İlanı Oluştur</h1>
          <p className="text-gray-600">Bandırma ve çevresindeki yetenekli adayları bulun</p>
        </div>

        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6" role="alert">
            <p className="font-medium">İş ilanınız başarıyla yayınlandı!</p>
            <p className="text-sm">İlanınız onay sürecinden sonra yayına alınacaktır.</p>
          </div>
        )}

        <Formik
          initialValues={{
            jobTitle: "",
            companyName: "",
            location: "",
            jobType: "",
            salary: "",
            jobDescription: "",
            requiredSkills: "",
            contactEmail: "",
            contactPhone: "",
            applicationDeadline: ""
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isValid }) => (
            <Form className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* İş Başlığı */}
                <div className="col-span-2">
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    İş Başlığı *
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={values.jobTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.jobTitle && touched.jobTitle ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                    placeholder="Örn: Yazılım Geliştirici, Satış Temsilcisi, Garson"
                  />
                  {errors.jobTitle && touched.jobTitle && (
                    <p className="mt-1 text-sm text-red-500">{errors.jobTitle}</p>
                  )}
                </div>

                {/* Şirket Adı */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Şirket Adı *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={values.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.companyName && touched.companyName ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                    placeholder="Şirketinizin adı"
                  />
                  {errors.companyName && touched.companyName && (
                    <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                  )}
                </div>

                {/* Konum */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Konum *
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.location && touched.location ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                  >
                    <option value="">Bandırma içinde konum seçin</option>
                    {bandirmaLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  {errors.location && touched.location && (
                    <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                {/* İş Türü */}
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                    İş Türü *
                  </label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={values.jobType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.jobType && touched.jobType ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                  >
                    <option value="">İş türünü seçin</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.jobType && touched.jobType && (
                    <p className="mt-1 text-sm text-red-500">{errors.jobType}</p>
                  )}
                </div>

                {/* Maaş */}
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                    Maaş Aralığı (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    value={values.salary}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Örn: 10.000₺ - 15.000₺"
                  />
                </div>

                {/* Son Başvuru Tarihi */}
                <div>
                  <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                    Son Başvuru Tarihi (Opsiyonel)
                  </label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    name="applicationDeadline"
                    value={values.applicationDeadline}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.applicationDeadline && touched.applicationDeadline ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                  />
                  {errors.applicationDeadline && touched.applicationDeadline && (
                    <p className="mt-1 text-sm text-red-500">{errors.applicationDeadline}</p>
                  )}
                </div>

                {/* İş Açıklaması */}
                <div className="col-span-2">
                  <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    İş Açıklaması *
                  </label>
                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    value={values.jobDescription}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={6}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.jobDescription && touched.jobDescription ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                    placeholder="İş pozisyonu hakkında detaylı bilgi verin. Adayın sorumlulukları ve görevleri neler olacak?"
                  />
                  {errors.jobDescription && touched.jobDescription && (
                    <p className="mt-1 text-sm text-red-500">{errors.jobDescription}</p>
                  )}
                </div>

                {/* Gerekli Beceriler */}
                <div className="col-span-2">
                  <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700 mb-1">
                    Gerekli Yetenekler *
                  </label>
                  <textarea
                    id="requiredSkills"
                    name="requiredSkills"
                    value={values.requiredSkills}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={3}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.requiredSkills && touched.requiredSkills ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                    placeholder="İşe alacağınız adayda hangi becerileri arıyorsunuz? (Virgülle ayırarak yazın)"
                  />
                  {errors.requiredSkills && touched.requiredSkills && (
                    <p className="mt-1 text-sm text-red-500">{errors.requiredSkills}</p>
                  )}
                </div>

                {/* İletişim E-posta */}
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    İletişim E-posta *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={values.contactEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.contactEmail && touched.contactEmail ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                    placeholder="ornek@sirket.com"
                  />
                  {errors.contactEmail && touched.contactEmail && (
                    <p className="mt-1 text-sm text-red-500">{errors.contactEmail}</p>
                  )}
                </div>

                {/* İletişim Telefon */}
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    İletişim Telefon (Opsiyonel)
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={values.contactPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="05XX XXX XX XX"
                  />
                </div>
              </div>

              {/* Gönder Butonu */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    (isSubmitting || !isValid) && "opacity-70 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Yayınlanıyor..." : "İlanı Yayınla"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </PortalLayout>
  );
};

export default PostJobPage; 