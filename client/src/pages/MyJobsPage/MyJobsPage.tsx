import { useState, useEffect } from "react";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { Link } from "react-router-dom";

const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Örnek iş ilanları verisi
  const sampleJobs = [
    {
      id: 1,
      jobTitle: "Yazılım Geliştirici",
      companyName: "Bandırma Teknoloji",
      location: "Merkez",
      jobType: "Tam Zamanlı",
      createdAt: "2024-04-15",
      applicantsCount: 3,
      isActive: true
    },
    {
      id: 2,
      jobTitle: "Satış Temsilcisi",
      companyName: "ABC Pazarlama",
      location: "Erdek",
      jobType: "Yarı Zamanlı",
      createdAt: "2024-04-14",
      applicantsCount: 5,
      isActive: true
    },
    {
      id: 3,
      jobTitle: "Garson",
      companyName: "Sahil Restaurant",
      location: "Merkez",
      jobType: "Tam Zamanlı",
      createdAt: "2024-04-10",
      applicantsCount: 8,
      isActive: false
    }
  ];

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    // LocalStorage'dan ilanları al
    const fetchJobs = () => {
      try {
        // LocalStorage'dan ilanları al
        const storedJobs = JSON.parse(localStorage.getItem('myJobs') || '[]');
        
        // Eğer localStorage'da hiç ilan yoksa örnek verileri kullan
        if (storedJobs.length === 0) {
          // Örnek verileri localStorage'a kaydet
          localStorage.setItem('myJobs', JSON.stringify(sampleJobs));
          setJobs(sampleJobs);
        } else {
          // LocalStorage'daki ilanları kullan
          setJobs(storedJobs);
        }
      } catch (error) {
        console.error("İş ilanları alınırken hata:", error);
        // Hata durumunda örnek verileri göster
        setJobs(sampleJobs);
      } finally {
        setLoading(false);
      }
    };

    // Yükleme efekti için kısa bir gecikme
    setTimeout(fetchJobs, 1000);
  }, []);

  // İlanı aktif/pasif yap
  const toggleJobStatus = (jobId) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? {...job, isActive: !job.isActive} : job
    );
    
    // State'i güncelle
    setJobs(updatedJobs);
    
    // LocalStorage'ı güncelle
    localStorage.setItem('myJobs', JSON.stringify(updatedJobs));
    
    // Anasayfadaki ilanları da güncelle
    const allJobs = JSON.parse(localStorage.getItem('allJobs') || '[]');
    const updatedAllJobs = allJobs.map(job => 
      job.id === jobId ? {...job, isActive: !job.isActive} : job
    );
    localStorage.setItem('allJobs', JSON.stringify(updatedAllJobs));
  };

  return (
    <PortalLayout title="İlanlarım">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">İlanlarım</h1>
            <p className="mt-2 text-sm text-gray-700">
              Yayınladığınız tüm iş ilanlarını buradan yönetebilirsiniz.
            </p>
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
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-500">İlanlar yükleniyor...</p>
          </div>
        ) : jobs.length === 0 ? (
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
          <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    İlan
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Konum
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Tür
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Başvuru
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
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
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {job.jobType}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <Link 
                        to={`/job-applications/${job.id}`} 
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {job.applicantsCount || 0} başvuru
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
