import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers";
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
  job_id: string;
  user_id: string;
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
  applicantsCount: number;
  isActive: boolean;
}

const JobApplicationsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  
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
    // Güvenlik kontrolü - işveren hesabı değilse ana sayfaya yönlendir
    if (isAuthenticated && user && user.user_type_id !== "employer") {
      toast.error("Bu sayfa sadece işveren hesaplarına açıktır");
      navigate('/');
      return;
    }
    
    fetchData();
  }, [jobId, navigate, isAuthenticated, user]);
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      if (!jobId || !isAuthenticated) {
        toast.error("Erişim yetkiniz yok veya giriş yapmanız gerekiyor");
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
      // Önce mevcut job cache'inden kontrol et
      const cachedJobs = JSON.parse(localStorage.getItem('myJobs') || '[]');
      const cachedJob = cachedJobs.find(j => j.id === jobId || j._id === jobId);
      
      if (cachedJob) {
        setJob(cachedJob);
        return;
      }
      
      // API'den iş ilanı detaylarını al
      const token = localStorage.getItem('access_token');
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/jobs/${jobId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
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
          applicantsCount: 0, // Başvuru sayısı başvurular yüklenince güncellenecek
          isActive: jobData.is_active !== undefined ? jobData.is_active : true
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
      const token = localStorage.getItem('access_token');
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/jobs/${jobId}/applications`;
      
      console.log("JobApplicationsPage - Başvurular çekiliyor:", apiUrl);
      console.log("JobApplicationsPage - Kullanıcı ID:", user?._id);
      console.log("JobApplicationsPage - Kullanıcı türü:", user?.user_type_id);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        },
        credentials: 'include' // CORS için gerekli
      });
      
      if (!response.ok) {
        console.error(`JobApplicationsPage - Başvurular alınamadı, HTTP Durum: ${response.status}`);
        
        if (response.status === 401) {
          toast.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        
        // Hata yanıtını alalım
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Başvurular alınamadı: ${response.status}`;
        } catch (parseError) {
          errorMessage = `Başvurular alınamadı: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("JobApplicationsPage - API yanıtı:", data);
      
      if (data.success && data.data) {
        // Başvuruları ayarla ve göster
        setApplications(data.data);
        console.log(`JobApplicationsPage - ${data.data.length} başvuru yüklendi`);
        
        // İş ilanının başvuru sayısını güncelle
        if (job) {
          setJob({
            ...job,
            applicantsCount: data.data.length
          });
        }
        
        // Başvuru verilerini cache'leyelim
        localStorage.setItem(`applications_${jobId}`, JSON.stringify(data.data));
      } else {
        console.error("JobApplicationsPage - API yanıtı başarısız veya veri yok:", data);
        throw new Error("Başvuru verileri alınamadı");
      }
    } catch (error) {
      console.error("JobApplicationsPage - Başvuru verileri alınırken hata:", error);
      
      // Hata durumunda önbellekten veri göstermeyi deneyelim
      const cachedApplications = localStorage.getItem(`applications_${jobId}`);
      if (cachedApplications) {
        try {
          const parsedApplications = JSON.parse(cachedApplications);
          setApplications(parsedApplications);
          toast.warning("Çevrimdışı veriler gösteriliyor. Güncel veriler için sayfayı yenileyin.");
        } catch (parseError) {
          console.error("Önbellek verileri parse edilemedi:", parseError);
          toast.error("Başvurular yüklenemedi ve önbellek verileri geçersiz.");
        }
      } else {
        toast.error("Başvurular yüklenemedi: " + error.message);
      }
    }
  };
  
  // Başvuru durumunu güncelle
  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      // API'ye güncelleme isteği gönder
      const token = localStorage.getItem('access_token');
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/applications/${applicationId}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Durum güncellenemedi: ${response.status}`);
      }
      
      // UI'ı güncelle
      setApplications(applications.map(app => 
        app._id === applicationId ? {...app, status: newStatus} : app
      ));
      
      // Önbelleği güncelle
      const updatedApplications = applications.map(app => 
        app._id === applicationId ? {...app, status: newStatus} : app
      );
      localStorage.setItem(`applications_${jobId}`, JSON.stringify(updatedApplications));
      
      toast.success("Başvuru durumu güncellendi");
    } catch (error) {
      console.error("Başvuru durumu güncellenirken hata:", error);
      toast.error("Başvuru durumu güncellenemedi");
    }
  };

  if (loading) {
    return (
      <PortalLayout title="Başvurular Yükleniyor">
        <div className="container mx-auto py-20 px-4 text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-500">Başvurular Yükleniyor...</p>
        </div>
      </PortalLayout>
    );
  }

  if (!job) {
    return (
      <PortalLayout title="İlan Bulunamadı">
        <div className="container mx-auto py-20 px-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">İlan Bulunamadı</h2>
          <p className="mt-2 text-gray-600">Aradığınız ilan bulunamadı veya bu ilana erişim yetkiniz yok.</p>
          <button 
            onClick={() => navigate('/my-jobs')}
            className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            İlanlarıma Dön
          </button>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title={`Başvurular: ${job.jobTitle}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Üst bilgi kısmı */}
        <div className="pb-5 border-b border-gray-200 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{job.jobTitle} - Başvurular</h1>
            <p className="mt-2 text-sm text-gray-700">
              {job.companyName} - {job.location} - {job.jobType}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <button
              onClick={fetchData}
              className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Yenile
            </button>
            <Link
              to="/my-jobs"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              ← İlanlarıma Dön
            </Link>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz Başvuru Yok</h3>
            <p className="mt-1 text-sm text-gray-500">Bu ilana henüz başvuru yapılmamış.</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-500">
                          {application.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{application.name}</div>
                        <div className="flex flex-col sm:flex-row sm:gap-4">
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {application.email}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {application.phone}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {new Date(application.applied_date).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <select
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[application.status]?.bg || 'bg-gray-100'} ${statusColors[application.status]?.text || 'text-gray-800'} border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                          value={application.status}
                          onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                        >
                          <option value="pending">Beklemede</option>
                          <option value="reviewed">İncelendi</option>
                          <option value="interviewed">Mülakat</option>
                          <option value="accepted">Kabul Edildi</option>
                          <option value="rejected">Reddedildi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detay Kısmı */}
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {application.resume_url && (
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>CV/Özgeçmiş:</strong> <a href={application.resume_url.startsWith('http') ? application.resume_url : `https://${application.resume_url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">{application.resume_url}</a>
                      </div>
                    )}
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Başvuru Yazısı:</p>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-md">
                        {application.cover_letter || "Başvuru yazısı eklenmemiş."}
                      </p>
                    </div>
                  </div>
                  
                  {/* Butonlar */}
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={() => window.open(`mailto:${application.email}`, '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      E-posta Gönder
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