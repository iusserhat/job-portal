import { useState, useEffect } from "react";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { useAuth } from "@/providers";
import { Link } from "react-router-dom";

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Durum renkleri ve etiketleri
  const statusStyles = {
    pending: {
      badge: "bg-yellow-100 text-yellow-800",
      text: "Beklemede",
      description: "Başvurunuz henüz incelenmedi."
    },
    reviewed: {
      badge: "bg-blue-100 text-blue-800",
      text: "İncelendi",
      description: "Başvurunuz incelendi, değerlendirme süreci devam ediyor."
    },
    accepted: {
      badge: "bg-green-100 text-green-800",
      text: "Kabul Edildi",
      description: "Tebrikler! Başvurunuz kabul edildi. İşveren sizinle iletişime geçecektir."
    },
    rejected: {
      badge: "bg-red-100 text-red-800",
      text: "Reddedildi",
      description: "Maalesef başvurunuz kabul edilmedi. Diğer iş fırsatlarını değerlendirebilirsiniz."
    }
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    const fetchApplications = () => {
      try {
        // Tüm başvuruları al
        const allApplications = JSON.parse(localStorage.getItem('applications') || '[]');
        
        // Sadece mevcut kullanıcının başvurularını filtrele
        const userApplications = allApplications.filter(app => 
          app.userId === user?.id || app.email === user?.email
        );
        
        // En yeni başvuruları üstte göster
        const sortedApplications = userApplications.sort((a, b) => 
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        );
        
        setApplications(sortedApplications);
      } catch (error) {
        console.error("Başvurular alınırken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Yükleme efekti için kısa bir gecikme
    setTimeout(fetchApplications, 1000);
  }, [user]);

  return (
    <PortalLayout title="Başvurularım">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Başvurularım</h1>
          <p className="mt-2 text-sm text-gray-600">
            Tüm iş başvurularınızı buradan takip edebilirsiniz.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-500">Başvurular yükleniyor...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
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
            <h3 className="mt-2 text-base font-medium text-gray-900">Henüz başvuru yapmadınız</h3>
            <p className="mt-1 text-sm text-gray-500">İş fırsatlarını keşfetmek için anasayfayı ziyaret edin.</p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                İş İlanlarını Keşfet
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id} className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-medium text-gray-900">
                        {application.jobTitle}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">{application.companyName}</p>
                    </div>
                    <div className="ml-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[application.status || 'pending'].badge}`}>
                        {statusStyles[application.status || 'pending'].text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                        </svg>
                        Başvuru Tarihi: {new Date(application.appliedAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <Link
                        to={`/job/${application.jobId}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        İlanı Görüntüle
                      </Link>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className={`rounded-md bg-${application.status === 'rejected' ? 'red' : application.status === 'accepted' ? 'green' : 'yellow'}-50 p-4`}>
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">
                            {statusStyles[application.status || 'pending'].description}
                          </p>
                        </div>
                      </div>
                    </div>
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

export default MyApplicationsPage; 