import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { useAuth } from "@/providers";
import axios from "axios";
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
  contact_email: string;
  contact_phone: string;
  application_deadline: string;
}

// Başvuru için tip tanımlaması
interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  coverLetter: string;
  resume: string;
  appliedAt: string;
  status: string;
}

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Form validasyon şeması
  const validationSchema = Yup.object({
    name: Yup.string().required("İsim Soyisim zorunludur"),
    email: Yup.string().email("Geçerli bir e-posta adresi girin").required("E-posta zorunludur"),
    phone: Yup.string().required("Telefon numarası zorunludur"),
    coverLetter: Yup.string().required("Başvuru yazısı zorunludur").min(50, "En az 50 karakter olmalıdır"),
    resume: Yup.string().required("CV/Özgeçmiş bilgisi zorunludur")
  });

  // İlan detaylarını getir
  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        console.log("JobDetailPage - İlan detayları alınıyor, ID:", id);
        console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
        
        // API'den iş ilanı detaylarını çek
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/basic-jobs/${id}`;
        console.log("API isteği gönderiliyor:", apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error("API yanıtı alınamadı:", response.status, response.statusText);
          
          // Hata yanıtını almaya çalışalım
          let errorDetail = "";
          try {
            const errorData = await response.json();
            errorDetail = errorData.message || errorData.error || "";
            console.error("API hata detayı:", errorData);
          } catch (e) {
            try {
              errorDetail = await response.text();
            } catch (e2) {
              errorDetail = "Detay yok";
            }
          }
          
          throw new Error(`İş ilanı detayları alınamadı: ${response.status} ${response.statusText} - ${errorDetail}`);
        }
        
        const data = await response.json();
        
        if (data && data.success && data.data) {
          console.log("MongoDB'den alınan iş ilanı detayı:", data.data);
          
          // MongoDB'den gelen veriyi formatla
          const formattedJob = {
            id: data.data._id,
            jobTitle: data.data.job_title || "İsimsiz İlan",
            companyName: data.data.company_name || "İsimsiz Şirket",
            location: data.data.location_name || "Belirtilmemiş",
            jobType: data.data.job_type_id?.name || "Belirtilmemiş",
            createdAt: data.data.created_date || new Date().toISOString(),
            salary: data.data.salary_range || "Belirtilmemiş",
            requiredSkills: data.data.required_skills || [],
            description: data.data.job_description || "",
            isActive: data.data.is_active !== undefined ? data.data.is_active : true,
            applicantsCount: 0, // Başvuru sayısı şimdilik 0 olarak belirle
            contact_email: data.data.contact_email,
            contact_phone: data.data.contact_phone,
            application_deadline: data.data.application_deadline
          };
          
          console.log("Formatlanmış iş ilanı detayı:", formattedJob);
          setJob(formattedJob);
        } else {
          console.warn("MongoDB'den alınan veri formatı uyumsuz veya boş:", data);
          throw new Error("İş ilanı detayları alınamadı");
        }
      } catch (error) {
        console.error("İş detayı alınırken hata:", error);
        // İlan bulunamadıysa anasayfaya yönlendir
        console.log("JobDetailPage - İlan bulunamadı");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    // Kullanıcının bu ilana daha önce başvurup başvurmadığını kontrol et
    const checkIfApplied = async () => {
      if (isAuthenticated && user) {
        try {
          // Burada API üzerinden kullanıcının bu ilana başvuru durumunu kontrol edebilirsiniz
          // Şimdilik localStorage üzerinden kontrol ediyoruz
          const applications: JobApplication[] = JSON.parse(localStorage.getItem('applications') || '[]');
          
          const hasUserApplied = applications.some(app => 
            app.jobId.toString() === id && app.userId === user.id
          );
          
          console.log("JobDetailPage - Kullanıcı daha önce başvurmuş mu:", hasUserApplied);
          setHasApplied(hasUserApplied);
        } catch (error) {
          console.error("Başvuru kontrolü sırasında hata:", error);
        }
      }
    };

    fetchJobDetail();
    checkIfApplied();
  }, [id, navigate, isAuthenticated, user]);

  // Başvuru gönderimi
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      console.log("JobDetailPage - Yeni başvuru oluşturuluyor");
      
      if (!job) {
        console.error("JobDetailPage - Başvuru yapılacak iş ilanı bulunamadı");
        toast.error("Başvuru yapılacak iş ilanı bulunamadı.");
        return;
      }
      
      // Başvuru verilerini hazırla
      const applicationData = {
        job_id: id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        cover_letter: values.coverLetter
      };
      
      console.log("Gönderilecek başvuru verileri:", applicationData);
      
      // Doğrudan başvuru API'sine istek gönder
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/direct-jobs/${id}/apply`;
      console.log("Başvuru API URL:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });
      
      if (!response.ok) {
        // API'den hata yanıtını ayrıştırma
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
      console.log("Başvuru başarıyla gönderildi:", data);
      
      // UI'ı güncelle - Başvuru başarılı
      setApplicationSuccess(true);
      setHasApplied(true);
      resetForm();
      
      // Başvuru sayısını güncelle
      try {
        const countApiUrl = `${import.meta.env.VITE_API_URL}/api/v1/direct-jobs/${id}/application-count`;
        const countResponse = await fetch(countApiUrl);
        if (countResponse.ok) {
          const countData = await countResponse.json();
          if (countData.success && countData.data && typeof countData.data.count === 'number') {
            // Eğer job değişkeninde applicantsCount varsa, güncelle
            if (job) {
              job.applicantsCount = countData.data.count;
            }
          }
        }
      } catch (countError) {
        console.error("Başvuru sayısı alınamadı:", countError);
      }
      
      // Kullanıcıya bildirim göster
      toast.success("Başvurunuz başarıyla gönderildi!", {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "#fff"
        },
        icon: "👍"
      });
      
      // Mevcut başvuruları localStorage'dan al ve güncelle (önbellek için)
      try {
        let existingApplications = JSON.parse(localStorage.getItem('applications') || '[]');
        
        // Yeni başvuruyu ekle
        const application = {
          id: data.data._id,
          jobId: id,
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          userId: user?._id || 'guest',
          name: values.name,
          email: values.email,
          phone: values.phone,
          coverLetter: values.coverLetter,
          resume: values.resume || '',
          appliedAt: new Date().toISOString(),
          status: 'pending'
        };
        
        existingApplications.push(application);
        localStorage.setItem('applications', JSON.stringify(existingApplications));
      } catch (error) {
        console.error("localStorage kullanımında hata:", error);
      }
      
      // 2 saniye sonra başvuru formunu gizle, teşekkür mesajını göster
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);
      
    } catch (error) {
      console.error("Başvuru gönderilirken hata:", error);
      toast.error(error instanceof Error ? error.message : "Başvuru gönderilirken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout title="İş Detayı Yükleniyor">
        <div className="container mx-auto py-20 px-4 text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-500">İş İlanı Detayları Yükleniyor...</p>
        </div>
      </PortalLayout>
    );
  }

  if (!job) {
    return (
      <PortalLayout title="İlan Bulunamadı">
        <div className="container mx-auto py-20 px-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">İlan Bulunamadı</h2>
          <p className="mt-2 text-gray-600">Aramakta olduğunuz iş ilanı bulunamadı.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Anasayfaya Dön
          </button>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title={job.jobTitle}>
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        {/* İş İlanı Header */}
        <div className="bg-white rounded-lg shadow p-8 border-t-4 border-indigo-600">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.jobTitle}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-indigo-600 font-medium">{job.companyName}</span>
                <span className="text-gray-500">•</span>
                <div className="flex items-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </div>
                <span className="text-gray-500">•</span>
                <div className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  {job.jobType}
                </div>
                <span className="text-gray-500">•</span>
                <div className="text-gray-500 text-sm">
                  İlan Tarihi: {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col">
              <div className="text-sm font-medium text-gray-900">
                Maaş: <span className="text-indigo-600">{job.salary}</span>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {job.applicantsCount || 0} başvuru
                </span>
              </div>
            </div>
          </div>
          
          {/* İş İlanı İçeriği */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">İş Açıklaması</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {job.description}
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Aranan Nitelikler</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills && job.requiredSkills.map((skill, index) => (
                <span key={index} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Başvuru Formu */}
        {isAuthenticated ? (
          <div className="mt-10 bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Bu İlana Başvur</h2>
            <p className="mt-2 text-gray-600">Bilgilerinizi doldurun ve bu pozisyon için başvurunuzu gönderin.</p>
            
            {applicationSuccess && (
              <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Başvurunuz başarıyla gönderildi!</p>
                    <p className="text-sm mt-1">Başvurunuz değerlendirildikten sonra sizinle iletişime geçilecektir. Bu iş ilanı için tekrar başvuramazsınız.</p>
                  </div>
                </div>
              </div>
            )}
            
            {hasApplied ? (
              <div className="mt-6 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded" role="alert">
                <p className="font-medium">Bu ilana daha önce başvurdunuz!</p>
                <p className="text-sm">Başvurunuz değerlendirme sürecindedir. Gelişmeler için e-posta adresinizi kontrol ediniz.</p>
              </div>
            ) : (
              <Formik
                initialValues={{
                  name: "",
                  email: "",
                  phone: "",
                  coverLetter: "",
                  resume: ""
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, handleChange, handleBlur, isValid }) => (
                  <Form className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* İsim Soyisim */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          İsim Soyisim *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.name && touched.name ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                          }`}
                          placeholder="Adınız Soyadınız"
                        />
                        {errors.name && touched.name && (
                          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      {/* E-posta */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          E-posta Adresi *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.email && touched.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                          }`}
                          placeholder="ornek@gmail.com"
                        />
                        {errors.email && touched.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>
                      
                      {/* Telefon */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon Numarası *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.phone && touched.phone ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                          }`}
                          placeholder="05XX XXX XX XX"
                        />
                        {errors.phone && touched.phone && (
                          <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                      </div>
                      
                      {/* CV/Özgeçmiş */}
                      <div>
                        <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                          CV/Özgeçmiş *
                        </label>
                        <input
                          type="text"
                          id="resume"
                          name="resume"
                          value={values.resume}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.resume && touched.resume ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                          }`}
                          placeholder="LinkedIn profiliniz veya CV linkiniz"
                        />
                        {errors.resume && touched.resume && (
                          <p className="mt-1 text-sm text-red-500">{errors.resume}</p>
                        )}
                      </div>
                      
                      {/* Başvuru Yazısı */}
                      <div className="col-span-1 md:col-span-2">
                        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                          Başvuru Yazısı / Ön Yazı *
                        </label>
                        <textarea
                          id="coverLetter"
                          name="coverLetter"
                          value={values.coverLetter}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          rows={5}
                          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                            errors.coverLetter && touched.coverLetter ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                          }`}
                          placeholder="Neden bu pozisyona başvurduğunuzu ve neden sizin seçilmeniz gerektiğini açıklayın..."
                        />
                        {errors.coverLetter && touched.coverLetter && (
                          <p className="mt-1 text-sm text-red-500">{errors.coverLetter}</p>
                        )}
                      </div>
                    </div>

                    {/* Başvur Butonu */}
                    <div className="mt-8">
                      <button
                        type="submit"
                        className="w-full md:w-auto bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Başvuruyu Gönder
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        ) : (
          <div className="mt-10 bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900">Bu ilana başvurmak için giriş yapmalısınız</h3>
            <p className="mt-2 text-gray-600">Hesabınız yoksa hemen ücretsiz kayıt olabilirsiniz.</p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50"
              >
                Kayıt Ol
              </button>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default JobDetailPage; 