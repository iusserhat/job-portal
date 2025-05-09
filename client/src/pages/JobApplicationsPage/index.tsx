import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { toast } from "react-hot-toast";

// Başvuru için tip tanımlaması
interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume_url?: string;
  status: string;
  applied_date: string;
}

// İş ilanı için tip tanımlaması
interface JobPosting {
  id: string;
  _id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  createdAt: string;
  requiredSkills: string[];
  description: string;
  isActive: boolean;
  applicantsCount: number;
}

const JobApplicationsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Statü renkleri
  const statusColors = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Beklemede" },
    reviewed: { bg: "bg-blue-100", text: "text-blue-800", label: "İncelendi" },
    interviewed: { bg: "bg-purple-100", text: "text-purple-800", label: "Mülakat" },
    accepted: { bg: "bg-green-100", text: "text-green-800", label: "Kabul Edildi" },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: "Reddedildi" }
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchData();
  }, [jobId]);
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      if (!jobId) {
        toast.error("İş ilanı ID'si bulunamadı");
        navigate('/my-jobs');
        return;
      }
      
      // Önce iş ilanı bilgilerini al
      await fetchJobDetails();
      
      // Başvuruları al
      await fetchApplications();
      
    } catch (error) {
      console.error("Başvuru bilgileri alınırken hata:", error);
      toast.error("Başvurular yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  
  // İş ilanı detaylarını API'den çek
  const fetchJobDetails = async () => {
    try {
      // API'den iş ilanı detaylarını al
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/direct-jobs/${jobId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`İş ilanı alınamadı: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const jobData = data.data;
        
        // İş ilanı datasını formatlayıp kaydet
        const formattedJob = {
          id: jobData._id,
          _id: jobData._id,
          jobTitle: jobData.job_title || "İsimsiz İlan",
          companyName: jobData.company_name || "İsimsiz Şirket",
          location: jobData.location_name || "Belirtilmemiş",
          jobType: jobData.job_type_id?.name || "Belirtilmemiş",
          createdAt: jobData.created_date || new Date().toISOString(),
          requiredSkills: jobData.required_skills || [],
          description: jobData.job_description || "",
          isActive: jobData.is_active !== undefined ? jobData.is_active : true,
          applicantsCount: 0 // Başvuru sayısı başvurular yüklenince güncellenecek
        };
        
        setJob(formattedJob);
      }
    } catch (error) {
      console.error("İş ilanı detayları alınırken hata:", error);
      toast.error("İş ilanı detayları alınamadı");
    }
  };
  
  // İlana yapılan başvuruları API'den çek
  const fetchApplications = async () => {
    try {
      // API'den başvuruları al
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/direct-jobs/${jobId}/applications`;
      
      console.log("Başvurular çekiliyor:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Başvurular alınamadı, HTTP Durum: ${response.status}`);
        
        // Hata yanıtını alalım
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Başvurular alınamadı: ${response.status}`;
          console.error("API hata mesajı:", errorData);
        } catch (parseError) {
          errorMessage = `Başvurular alınamadı: ${response.status} ${response.statusText}`;
          console.error("API yanıt ayrıştırma hatası:", parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("API yanıtı:", data);
      
      if (data.success && Array.isArray(data.data)) {
        // Başvuruları ayarla ve göster
        setApplications(data.data);
        console.log(`${data.data.length} başvuru yüklendi`);
        
        // Her bir başvuruyu kontrol et
        data.data.forEach((app, index) => {
          console.log(`Başvuru ${index + 1}:`, {
            id: app._id,
            name: app.name,
            email: app.email,
            phone: app.phone,
            cover_letter: app.cover_letter ? app.cover_letter.substring(0, 50) + '...' : 'Yok',
            status: app.status,
            date: app.applied_date
          });
        });
        
        // İş ilanının başvuru sayısını güncelle
        if (job) {
          setJob({
            ...job,
            applicantsCount: data.data.length
          });
        }
      } else {
        console.error("API yanıtı başarısız veya veri dizisi değil:", data);
        throw new Error("Başvuru verileri alınamadı");
      }
    } catch (error) {
      console.error("Başvuru verileri alınırken hata:", error);
      toast.error("Başvurular yüklenemedi: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    }
  };
  
  if (loading) {
    return (
      <PortalLayout title="Başvurular Yükleniyor">
        <div className="container mx-auto py-10 px-4">
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-500">Başvurular yükleniyor...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (!job) {
    return (
      <PortalLayout title="İş İlanı Bulunamadı">
        <div className="container mx-auto py-10 px-4">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-gray-900">İş İlanı Bulunamadı</h2>
            <p className="mt-2 text-gray-600">İlgili iş ilanı bulunamadı veya erişim yetkiniz yok.</p>
            <button
              onClick={() => navigate('/my-jobs')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              İlanlarım Sayfasına Dön
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title={`Başvurular: ${job.jobTitle}`}>
      <div className="container mx-auto py-10 px-4">
        {/* İş İlanı Başlık */}
        <div className="mb-8 pb-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {job.jobTitle} Başvuruları
              </h1>
              <p className="mt-1 text-gray-500">{job.companyName} - {job.location}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {applications.length} Başvuru
              </span>
              <button
                onClick={() => navigate(`/job/${job.id}`)}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                İlanı Görüntüle
              </button>
            </div>
          </div>
        </div>

        {/* Başvuru Listesi */}
        {applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Henüz başvuru yok</h3>
            <p className="mt-1 text-sm text-gray-500">Bu iş ilanına henüz başvuru yapılmamış.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application._id} className="p-4 sm:p-6 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="mb-4 sm:mb-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 font-bold">
                          {application.name && application.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{application.name || "İsimsiz Başvuru"}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">E-posta:</span> {application.email || "Belirtilmemiş"}
                            </p>
                            <span className="text-gray-500">•</span>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Telefon:</span> {application.phone || "Belirtilmemiş"}
                            </p>
                            <span className="text-gray-500">•</span>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Tarih:</span> {application.applied_date ? new Date(application.applied_date).toLocaleDateString('tr-TR') : "Belirtilmemiş"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]?.bg || 'bg-gray-100'} ${statusColors[application.status]?.text || 'text-gray-800'}`}>
                        {statusColors[application.status]?.label || 'Beklemede'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Başvuru Yazısı</h4>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-800 whitespace-pre-line">
                      {application.cover_letter || "Başvuru yazısı bulunmuyor."}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        // Başvuru yazısını ve adayı incelendi olarak işaretle
                        // TODO: API entegre et
                        toast.success("Durum güncellenecek: İncelendi");
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      İncelendi
                    </button>
                    <button
                      onClick={() => {
                        // Adayı mülakata çağır
                        // TODO: API entegre et
                        toast.success("Durum güncellenecek: Mülakat");
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Mülakat
                    </button>
                    <button
                      onClick={() => {
                        // Adayı kabul et
                        // TODO: API entegre et
                        toast.success("Durum güncellenecek: Kabul Edildi");
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                    >
                      Kabul Et
                    </button>
                    <button
                      onClick={() => {
                        // Adayı reddet
                        // TODO: API entegre et
                        toast.success("Durum güncellenecek: Reddedildi");
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700"
                    >
                      Reddet
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default JobApplicationsPage; 