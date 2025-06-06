import { useState, useEffect } from "react";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers";
import { toast } from "react-hot-toast";

// İş ilanı tipi
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
  job_title?: string;
  company_name?: string;
  location_name?: string;
  is_active?: boolean;
}

const MyJobsPage = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const location = window.location;

  // API URL'i için önceden tanımlı değerler (farklı ortamlar için)
  const API_ENDPOINTS = {
    local: "http://localhost:5555/api/v1/jobs/user-jobs",
    production: "https://job-portal-gfus.onrender.com/api/v1/jobs/user-jobs",
    netlify: "https://serene-begonia-ded421.netlify.app/api/v1/jobs/user-jobs"
  };
  
  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    console.log("MyJobsPage - useEffect: İlanlar yükleniyor");
    
    // URL'den token kontrolü yap
    const urlParams = new URLSearchParams(location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      console.log("URL'den token bulundu, uzunluk:", urlToken.length);
      
      // URL'den gelen kullanıcı bilgilerini kontrol et
      const urlUser = urlParams.get('user');
      if (urlUser) {
        try {
          // URL'den gelen kullanıcı bilgilerini parse et
          const userData = JSON.parse(decodeURIComponent(urlUser));
          console.log("URL'den kullanıcı bilgileri alındı:", userData);
        } catch (parseError) {
          console.error("URL'den gelen kullanıcı bilgileri parse edilemedi:", parseError);
        }
      }
    }
    
    // Kimlik doğrulama kontrollerini kaldırıyoruz ve doğrudan ilanları çekiyoruz
    fetchMyJobs();
  }, [location.search]);

  // API'den kullanıcının kendi ilanlarını çek
  const fetchMyJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Öncelikle üretim ortamındaki API URL'ini kullan
      const apiUrl = API_ENDPOINTS.production;
      
      console.log(`Kullanıcı ilanları çekiliyor, API URL: ${apiUrl}`);
      
      // Önce URL'den token kontrolü yap
      const urlParams = new URLSearchParams(location.search);
      const urlToken = urlParams.get('token');
      
      // Local storage erişim hatalarını ele al
      let token;
      try {
        token = localStorage.getItem('access_token');
      } catch (storageError) {
        console.error("LocalStorage erişim hatası:", storageError);
        // URL'den gelen token yoksa hata göster
        if (!urlToken) {
          setError("Tarayıcı ayarları nedeniyle oturum bilgilerine erişilemiyor. Çerezleri etkinleştirin veya gizli moddan çıkın.");
          setLoading(false);
          return;
        }
        // URL'den gelen token varsa onu kullan
        token = urlToken;
      }
      
      // localStorage'dan gelen token yoksa URL'den gelen token varsa onu kullan
      if (!token && urlToken) {
        token = urlToken;
      }
      
      if (!token) {
        console.error("Token bulunamadı, kullanıcı giriş yapmamış olabilir");
        setError("Oturum bilginiz bulunamadı. Lütfen tekrar giriş yapın.");
        setJobs([]);
        setLoading(false);
        return;
      }
      
      // Token'ı kontrol et - uzunluğunu ve formatını görüntüle
      console.log("Token uzunluğu:", token.length);
      console.log("Token başlangıcı:", token.substring(0, 20) + "...");
      
      // Bearer prefixi kontrolü ve eklemesi
      if (!token.startsWith('Bearer ')) {
        token = `Bearer ${token}`;
      }
      
      // API isteği için başlıkları oluştur
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token // JWT token'ı ekle
      };

      console.log(`Backend isteği gönderiliyor... (URL: ${apiUrl})`);
      
      // Backend'e istek gönder
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers,
          // CORS sorunu çözmek için
          credentials: 'omit', // No credentials
          mode: 'cors' // Explicit CORS mode
        });
        
        console.log(`HTTP durum kodu:`, response.status);
        
        // Başarılı yanıt alınmadıysa
        if (!response.ok) {
          // Yetkilendirme hatası ise
          if (response.status === 401) {
            // Token'ı yenile veya kullanıcıyı login sayfasına yönlendir
            console.error("401 - Yetkisiz erişim. Token geçersiz veya süresi dolmuş olabilir.");
            try {
              localStorage.removeItem('access_token'); // Geçersiz token'ı kaldır
            } catch (storageError) {
              console.error("LocalStorage silerken hata:", storageError);
            }
            setError("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
            setLoading(false);
            return;
          }
          
          // API hata mesajını almaya çalış
          let errorDetail = "";
          try {
            const errorData = await response.json();
            errorDetail = errorData.message || errorData.error || "";
          } catch (e) {
            try {
              errorDetail = await response.text();
            } catch (e2) {
              errorDetail = "Detay yok";
            }
          }
          
          throw new Error(`İlanlar alınamadı: ${response.status} ${response.statusText} - ${errorDetail}`);
        }
        
        let data;
        try {
          data = await response.json();
          console.log("API yanıtı:", data);
        } catch (jsonError) {
          console.error("API yanıtı JSON olarak işlenemedi:", jsonError);
          setError("API yanıtı beklendiği gibi değil.");
          setLoading(false);
          return;
        }
        
        if (data && data.success && data.data && Array.isArray(data.data)) {
          console.log("MongoDB'den alınan kullanıcı ilanları:", data.data.length);
          
          // MongoDB'den gelen veriyi formatla
          const formattedJobs = data.data.map((job: any) => ({
            id: job._id,
            _id: job._id,
            jobTitle: job.job_title || "İsimsiz İlan",
            companyName: job.company_name || "İsimsiz Şirket",
            location: job.location_name || "Belirtilmemiş",
            jobType: job.job_type_id?.name || "Belirtilmemiş",
            createdAt: job.created_date || new Date().toISOString(),
            applicantsCount: job.applications_count || 0,
            isActive: job.is_active !== undefined ? job.is_active : true,
            
            // Orijinal alanları da sakla
            job_title: job.job_title,
            company_name: job.company_name,
            location_name: job.location_name,
            is_active: job.is_active
          }));
          
          console.log("Formatlanmış kullanıcı ilanları:", formattedJobs);
          
          if (formattedJobs.length > 0) {
            setJobs(formattedJobs);
            toast.success(`${formattedJobs.length} ilan başarıyla yüklendi`);
          } else {
            console.log("İlan bulunamadı, boş dizi döndü");
            setJobs([]);
            toast.info("Henüz bir iş ilanı yayınlamamışsınız");
          }
        } else {
          console.warn("MongoDB'den alınan veri formatı uyumsuz veya boş:", data);
          setError("Veriler beklenen formatta değil");
          setJobs([]);
        }
      } catch (error: any) {
        console.error("İş ilanları alınırken hata:", error);
        const errorMessage = error.message || "Bilinmeyen hata";
        setError(`İlanlarınız yüklenirken bir hata oluştu: ${errorMessage}. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.`);
        // Hata durumunda boş dizi gösterelim
        setJobs([]);
      } finally {
        setLoading(false);
      }
    } catch (outerError: any) {
      console.error("Beklenmeyen bir hata oluştu:", outerError);
      setError("Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      setJobs([]);
      setLoading(false);
    }
  };

  // İlanı aktif/pasif yap
  const toggleJobStatus = async (jobId: string) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      
      if (!job) {
        toast.error("İlan bulunamadı");
        return;
      }
      
      const newStatus = !job.isActive;
      
      // Önce URL'den token kontrolü yap
      const urlParams = new URLSearchParams(location.search);
      const urlToken = urlParams.get('token');
      
      // Local storage erişim hatalarını ele al
      let token;
      try {
        token = localStorage.getItem('access_token');
      } catch (storageError) {
        console.error("LocalStorage erişim hatası:", storageError);
        // URL'den gelen token yoksa hata göster
        if (!urlToken) {
          toast.error("Tarayıcı ayarları nedeniyle oturum bilgilerine erişilemiyor.");
          return;
        }
        // URL'den gelen token varsa onu kullan
        token = urlToken;
      }
      
      // localStorage'dan gelen token yoksa URL'den gelen token varsa onu kullan
      if (!token && urlToken) {
        token = urlToken;
      }
      
      if (!token) {
        toast.error("Oturum bilginiz bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }
      
      // Bearer prefixi kontrolü ve eklemesi
      if (!token.startsWith('Bearer ')) {
        token = `Bearer ${token}`;
      }
      
      // API'ye güncelleme isteği gönder - ÖNEMLİ: Production URL'ini kullan!
      const apiUrl = `https://job-portal-gfus.onrender.com/api/v1/jobs/${jobId}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token // JWT token'ı ekle
        },
        body: JSON.stringify({
          is_active: newStatus
        }),
        // CORS sorunu çözmek için
        credentials: 'omit', // No credentials 
        mode: 'cors' // Explicit CORS mode
      });
      
      if (!response.ok) {
        // Yetkilendirme hatası ise
        if (response.status === 401) {
          toast.error("Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.");
          return;
        }
        
        // API hata mesajını almaya çalış
        let errorDetail = "";
        try {
          const errorData = await response.json();
          errorDetail = errorData.message || errorData.error || "";
        } catch (e) {
          // JSON olarak işlenemiyorsa text olarak okuyalım
          try {
            errorDetail = await response.text();
          } catch (e2) {
            errorDetail = "Detay yok";
          }
        }
        
        throw new Error(`İlan durumu güncellenemedi: ${response.status} ${response.statusText} - ${errorDetail}`);
      }
      
      // UI'ı güncelle
      const updatedJobs = jobs.map(job => 
        job.id === jobId ? {...job, isActive: newStatus} : job
      );
      
      setJobs(updatedJobs);
      toast.success(`İlan ${newStatus ? 'aktif' : 'pasif'} duruma getirildi`);
    } catch (error) {
      console.error("İlan durumu güncellenirken hata:", error);
      toast.error("İlan durumu güncellenirken bir hata oluştu.");
    }
  };

  return (
    <PortalLayout title="İlanlarım">
      <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="sm:flex sm:items-center mb-4 sm:mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">İlanlarım</h1>
            <p className="mt-1 sm:mt-2 text-sm text-gray-700">
              Yayınladığınız tüm iş ilanlarını buradan yönetebilirsiniz.
            </p>
            {error && (
              <div className="mt-2 p-2 sm:p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-xs sm:text-sm">
                {error}
                <button 
                  onClick={fetchMyJobs}
                  className="ml-2 underline text-indigo-600 hover:text-indigo-800"
                >
                  Yeniden Dene
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/post-job"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Yeni İlan Ekle
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 sm:py-10">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-500">İlanlar yükleniyor...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 sm:py-10 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg 
              className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" 
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">İlan bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Henüz bir iş ilanı yayınlamamışsınız.</p>
            <div className="mt-6">
              <Link
                to="/post-job"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                İlan Oluştur
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-2 sm:mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            {/* Mobil - Liste görünümü (sadece sm ekran boyutuna kadar) */}
            <div className="sm:hidden space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className={`bg-white p-3 border rounded-lg ${!job.isActive ? "bg-gray-50" : ""}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.jobTitle}</h3>
                      <p className="text-sm text-gray-500">{job.companyName}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        job.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                    <div>{job.jobType}</div>
                    <div>{new Date(job.createdAt).toLocaleDateString('tr-TR')}</div>
                  </div>
                  
                  <div className="flex items-center text-xs mb-3">
                    <Link 
                      to={`/job-applications/${job._id || job.id}`} 
                      className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="relative flex h-3 w-3 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                      {job.applicantsCount || 0} başvuru
                    </Link>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <button
                      type="button"
                      onClick={() => toggleJobStatus(job.id)}
                      className={`text-xs ${
                        job.isActive
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {job.isActive ? "Pasif Yap" : "Aktif Yap"}
                    </button>
                    <Link
                      to={`/job/${job.id}`}
                      className="text-xs text-indigo-600 hover:text-indigo-900"
                    >
                      Görüntüle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tablet/Desktop - Tablo görünümü (sadece sm'den büyük ekranlar için) */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    İlan
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Konum
                  </th>
                  <th className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Tür
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Başvuru
                  </th>
                  <th className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Tarih
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Durum
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {jobs.map((job) => (
                  <tr key={job.id} className={!job.isActive ? "bg-gray-50" : undefined}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="font-medium text-gray-900">{job.jobTitle}</div>
                      <div className="text-gray-500">{job.companyName}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {job.location}
                    </td>
                    <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {job.jobType}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <Link 
                        to={`/job-applications/${job._id || job.id}`} 
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Başvuruları görüntüle"
                      >
                        <span className="relative flex h-3 w-3 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        {job.applicantsCount || 0} başvuru
                      </Link>
                    </td>
                    <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          job.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleJobStatus(job.id)}
                          className={`${
                            job.isActive
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {job.isActive ? "Pasif Yap" : "Aktif Yap"}
                        </button>
                        <Link
                          to={`/job/${job.id}`}
                          className="text-indigo-600 hover:text-indigo-900 ml-2"
                        >
                          Görüntüle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default MyJobsPage;
