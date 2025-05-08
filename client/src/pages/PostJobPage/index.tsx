import { useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      // Form verilerini hazırla
      const newJob = {
        id: Date.now(), // Benzersiz ID oluştur
        jobTitle: values.jobTitle,
        companyName: values.companyName,
        location: values.location,
        jobType: values.jobType,
        salary: values.salary || "Belirtilmemiş",
        createdAt: new Date().toISOString().split('T')[0],
        description: values.jobDescription,
        requiredSkills: values.requiredSkills.split(',').map(skill => skill.trim()),
        applicantsCount: 0,
        isActive: true
      };
      
      console.log("İş ilanı verileri:", newJob);
      
      // Mevcut ilanları localStorage'dan al
      const existingJobs = JSON.parse(localStorage.getItem('myJobs') || '[]');
      
      // Yeni ilanı listeye ekle
      existingJobs.push(newJob);
      
      // Tüm ilanları localStorage'a kaydet
      localStorage.setItem('myJobs', JSON.stringify(existingJobs));
      
      // Anasayfada gösterilen ilanları da güncelle
      const allJobs = JSON.parse(localStorage.getItem('allJobs') || '[]');
      allJobs.unshift(newJob); // Yeni ilanı en başa ekle
      localStorage.setItem('allJobs', JSON.stringify(allJobs));
      
      // Başarılı sonuç
      setSubmitSuccess(true);
      resetForm();
      
      // 3 saniye sonra kullanıcıyı My Jobs sayfasına yönlendir
      setTimeout(() => {
        setSubmitSuccess(false);
        navigate('/my-jobs');
      }, 3000);
      
    } catch (error) {
      console.error("İş ilanı yayınlama hatası:", error);
      alert("İş ilanı yayınlanırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
  );
};

export default PostJobPage; 