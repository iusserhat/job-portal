import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PortalLayout from "@/components/layouts/portal/PortalLayout";
import { Link } from "react-router-dom";

const JobApplicationsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Statü renkleri
  const statusColors = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Beklemede" },
    reviewed: { bg: "bg-blue-100", text: "text-blue-800", label: "İncelendi" },
    accepted: { bg: "bg-green-100", text: "text-green-800", label: "Kabul Edildi" },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: "Reddedildi" }
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    const fetchData = () => {
      try {
        // İlan bilgisini al
        const myJobs = JSON.parse(localStorage.getItem('myJobs') || '[]');
        const jobInfo = myJobs.find(job => job.id === Number(jobId));
        
        if (!jobInfo) {
          navigate('/my-jobs');
          return;
        }
        
        setJob(jobInfo);
        
        // İlana ait başvuruları al
        const allApplications = JSON.parse(localStorage.getItem('applications') || '[]');
        const jobApplications = allApplications.filter(app => app.jobId === Number(jobId));
        
        setApplications(jobApplications);
      } catch (error) {
        console.error("Başvuru bilgileri alınırken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Yükleme efekti için kısa bir gecikme
    setTimeout(fetchData, 1000);
  }, [jobId, navigate]);
  
  // Başvuru durumunu güncelle
  const updateApplicationStatus = (applicationId, newStatus) => {
    // Mevcut başvuruları al
    const allApplications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    // Belirli başvurunun durumunu güncelle
    const updatedApplications = allApplications.map(app => 
      app.id === applicationId ? {...app, status: newStatus} : app
    );
    
    // LocalStorage'a kaydet
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
    
    // State'i güncelle
    setApplications(applications.map(app => 
      app.id === applicationId ? {...app, status: newStatus} : app
    ));
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
          <div className="mt-4 sm:mt-0">
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex text-sm">
                            <p className="font-medium text-indigo-600 truncate">{application.name}</p>
                          </div>
                          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-4">
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              {application.email}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-4">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              {application.phone}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-4">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {new Date(application.appliedAt).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[application.status].bg} ${statusColors[application.status].text}`}>
                            {statusColors[application.status].label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Detay Kısmı */}
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <div className="text-sm text-gray-700">
                          <strong>CV/Özgeçmiş:</strong> <a href={application.resume.startsWith('http') ? application.resume : `https://${application.resume}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">{application.resume}</a>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">Başvuru Yazısı:</p>
                          <p className="mt-1 text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-md">
                            {application.coverLetter}
                          </p>
                        </div>
                      </div>
                      
                      {/* Butonlar */}
                      <div className="mt-4 flex items-center justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 ${application.status === 'reviewed' ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          İncelendi
                        </button>
                        <button
                          type="button"
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-green-300 text-xs font-medium rounded shadow-sm text-green-700 bg-green-50 hover:bg-green-100 ${application.status === 'accepted' ? 'ring-2 ring-green-500' : ''}`}
                        >
                          Kabul Et
                        </button>
                        <button
                          type="button"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded shadow-sm text-red-700 bg-red-50 hover:bg-red-100 ${application.status === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
                        >
                          Reddet
                        </button>
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

export default JobApplicationsPage; 