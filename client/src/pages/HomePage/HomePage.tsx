import { useEffect, useState } from "react";
import {
  BookmarkIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Divider from "@/components/core-ui/Divider";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

// İş ilanı için tip tanımlaması
interface JobPosting {
  id: number | string;
  _id?: string; // MongoDB id'si
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  createdAt: string;
  salary: string;
  requiredSkills: string[];
  description: string;
  isActive: boolean;
  applicantsCount?: number;
  
  // MongoDB'den gelen alanlar
  job_title?: string;
  company_name?: string;
  location_name?: string;
  job_description?: string;
  salary_range?: string;
  required_skills?: string[];
  created_date?: string;
  is_active?: boolean;
}

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<JobPosting[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sayfa yüklendiğinde verileri getir
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // API URL'ini logged_api_url değişkenine alıp konsola basalım
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/direct-jobs`;
      const logged_api_url = apiUrl;
      
      console.log("İş ilanları çekiliyor:", logged_api_url);
      console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
      
      try {
        // CORS ve diğer sorunlar için headers ekle
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // 15 saniye timeout ekleyelim
          signal: AbortSignal.timeout(15000)
        });
        
        console.log("API yanıtı durumu:", response.status);
        
        if (!response.ok) {
          console.error("API yanıtı alınamadı:", response.status, response.statusText);
          
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
          
          const errorMessage = `API'den veri çekilemedi: ${response.status} ${response.statusText} - ${errorDetail}`;
          console.error(errorMessage);
          setError(errorMessage);
          toast.error("İş ilanları yüklenemedi");
          throw new Error(errorMessage);
        }
        
        let data;
        try {
          data = await response.json();
          console.log("API'den alınan veri:", data);
        } catch (jsonError) {
          console.error("API yanıtı JSON olarak işlenemedi:", jsonError);
          setError("API yanıtı işlenirken hata oluştu.");
          toast.error("İş ilanları yüklenemedi - geçersiz veri formatı");
          throw new Error("API yanıtı JSON olarak işlenemedi");
        }
        
        if (data && Array.isArray(data)) {
          // Doğrudan veri array olarak döndüyse
          processJobData(data);
        } 
        else if (data && data.success && data.data && Array.isArray(data.data)) {
          // API özel formatta döndüyse (success.data)
          processJobData(data.data);
        } else {
          console.warn("API'den alınan veri formatı uyumsuz veya boş:", data);
          setError("Veri formatı uyumsuz veya veri bulunamadı");
          setRecentJobs([]);
          toast.error("İş ilanları yüklenemedi");
        }
      } catch (fetchError: any) {
        console.error("API isteği sırasında hata:", fetchError);
        setError(`İş ilanları çekilemedi: ${fetchError.message || 'Bağlantı hatası'}`);
        toast.error("İş ilanları yüklenemedi - bağlantı hatası");
      }
    } catch (error: any) {
      console.error("İş ilanları getirme hatası:", error);
      setError(`İş ilanları yüklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      setRecentJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // İş ilanı verilerini işle
  const processJobData = (jobsData: any[]) => {
    console.log(`${jobsData.length} iş ilanı işleniyor`);
    
    // MongoDB'den gelen veriyi formatla
    const formattedJobs = jobsData.map((job: any) => ({
      id: job._id, // MongoDB ID'sini id olarak kullan
      _id: job._id, // Orijinal MongoDB ID'sini de sakla
      jobTitle: job.job_title || "İsimsiz İlan",
      companyName: job.company_name || "İsimsiz Şirket",
      location: job.location_name || "Belirtilmemiş",
      jobType: job.job_type_id?.name || "Belirtilmemiş",
      createdAt: job.created_date || new Date().toISOString(),
      salary: job.salary_range || "Belirtilmemiş",
      requiredSkills: job.required_skills || [],
      description: job.job_description || "",
      isActive: job.is_active !== undefined ? job.is_active : true,
      applicantsCount: 0, // Başvuru sayısı şimdilik 0 olarak belirle
      
      // MongoDB alanları da sakla
      job_title: job.job_title,
      company_name: job.company_name,
      location_name: job.location_name,
      job_description: job.job_description,
      salary_range: job.salary_range,
      required_skills: job.required_skills,
      created_date: job.created_date,
      is_active: job.is_active
    }));
    
    console.log("Formatlanmış iş ilanları:", formattedJobs);
    setRecentJobs(formattedJobs);

    // Her iş ilanı için başvuru sayısını getir
    formattedJobs.forEach(job => {
      fetchApplicationCount(job.id);
    });
    
    if (formattedJobs.length > 0) {
      toast.success(`${formattedJobs.length} iş ilanı yüklendi`);
    } else {
      toast.success("Henüz iş ilanı bulunmuyor");
    }
  };

  // Başvuru sayısını getirme
  const fetchApplicationCount = async (jobId: string) => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/direct-jobs/${jobId}/application-count`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        return; // Sessizce başarısız ol
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Başvuru sayısını güncelle
        setRecentJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId ? {...job, applicantsCount: data.data.count} : job
          )
        );
      }
    } catch (error) {
      console.error(`İş ilanı ${jobId} için başvuru sayısı alınamadı:`, error);
    }
  };

  return (
    <PortalLayout title="Ana Sayfa">
      <div className="bg-white">
        {/* Hero section */}
        <div className="relative isolate overflow-hidden pt-6 sm:pt-10 lg:pt-14">
          <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-indigo-50 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 hidden sm:block"></div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-12 lg:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6">
              <div className="max-w-xl lg:max-w-lg">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
                  Bandırma'da İş Bulmak Artık Daha Kolay
                </h1>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg leading-6 sm:leading-7 text-gray-600">
                  Bandırma ve çevresindeki en güncel iş ilanlarını keşfedin. 
                  İster deneyimli bir profesyonel olun, ister kariyerinize yeni başlıyor olun, 
                  size uygun pozisyonlar burada!
                </p>
                <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-x-6">
                  <a
                    href="#recent-jobs"
                    className="w-full sm:w-auto rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 text-center"
                  >
                    İş İlanlarını Gör
                  </a>
                  <a href="#" className="mt-3 sm:mt-0 text-sm font-semibold leading-6 text-gray-900">
                    İşveren Olarak Kayıt Ol <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <div className="mt-8 sm:mt-10 flex justify-center sm:justify-end gap-3 sm:gap-4 md:gap-6 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                <div className="hidden sm:block ml-auto w-24 sm:w-36 md:w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-last xl:pt-80">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
                  </div>
                </div>
                <div className="hidden sm:block mr-auto w-24 sm:w-36 md:w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1485217988980-11786ced9454?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
                  </div>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-x=.4&w=396&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
                  </div>
                </div>
                <div className="hidden sm:block w-24 sm:w-36 md:w-44 flex-none space-y-8 pt-32 sm:pt-0">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=left&w=400&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
                  </div>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1670272505284-8faba1c31f7d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
                  </div>
                </div>
                {/* Sadece mobil ekranlarda gösterilecek tek resim */}
                <div className="sm:hidden w-full max-w-[240px]">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1485217988980-11786ced9454?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent jobs section */}
        <div id="recent-jobs" className="py-8 sm:py-12 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                Güncel İş İlanları
              </h2>
              <p className="mt-2 text-sm sm:text-base leading-6 sm:leading-7 text-gray-600">
                Bandırma ve çevresindeki en yeni iş fırsatlarını keşfedin
              </p>
              {error && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  <p>{error}</p>
                  <button
                    onClick={fetchJobs}
                    className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Yeniden Dene
                  </button>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="mt-8 sm:mt-12 text-center py-16 sm:py-20">
                <div className="spinner"></div>
                <p className="mt-2 text-gray-500">İş İlanları Yükleniyor...</p>
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="mt-8 sm:mt-12 text-center py-16 sm:py-20">
                <p className="text-gray-500">Henüz ilan bulunmuyor.</p>
              </div>
            ) : (
              <div className="mx-auto mt-8 sm:mt-12 grid max-w-2xl grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-6 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {recentJobs.map((job) => (
                  <article key={job.id} className="flex flex-col items-start border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="w-full bg-indigo-100 p-3 sm:p-4">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
                        <span className="text-xs rounded bg-indigo-600 px-2 py-1 font-medium text-white">
                          {job.jobType}
                        </span>
                        <time dateTime={job.createdAt} className="text-xs text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                        </time>
                      </div>
                      <div className="relative mt-2">
                        <h3 className="text-base sm:text-lg font-semibold leading-6 text-gray-900 line-clamp-2">
                          <a href={`/job/${job.id}`}>
                            <span className="absolute inset-0" />
                            {job.jobTitle}
                          </a>
                        </h3>
                        <p className="text-sm text-gray-600 font-medium mt-1">{job.companyName}</p>
                      </div>
                    </div>
                    <div className="w-full p-3 sm:p-4">
                      <p className="mt-1 line-clamp-3 text-xs sm:text-sm leading-5 sm:leading-6 text-gray-600">
                        {job.description}
                      </p>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {job.requiredSkills && job.requiredSkills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills && job.requiredSkills.length > 3 && (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                            +{job.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0">
                      <div className="flex items-center text-xs text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        {job.salary}
                      </div>
                    </div>
                    <div className="w-full p-3 sm:p-4 bg-gray-50 flex justify-center">
                      <Link 
                        to={`/job/${job.id}`} 
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        İlana Başvur
                        <span aria-hidden="true"> &rarr;</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={fetchJobs}
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50"
              >
                İlanları Yenile
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default HomePage;
