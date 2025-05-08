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

const HomePage = () => {
  const [recentJobs, setRecentJobs] = useState([]);
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
      salary: "15.000₺ - 25.000₺",
      requiredSkills: ["React", "Node.js", "MongoDB"],
      description: "Bandırma merkezli teknoloji şirketimiz için full-stack geliştirici arıyoruz...",
      isActive: true
    },
    {
      id: 2,
      jobTitle: "Satış Temsilcisi",
      companyName: "ABC Pazarlama",
      location: "Erdek",
      jobType: "Yarı Zamanlı",
      createdAt: "2024-04-14",
      salary: "Asgari Ücret + Prim",
      requiredSkills: ["İletişim", "Satış Deneyimi", "MS Office"],
      description: "Erdek'teki mağazamız için deneyimli satış temsilcileri arıyoruz...",
      isActive: true
    },
    {
      id: 3,
      jobTitle: "Garson",
      companyName: "Sahil Restaurant",
      location: "Merkez",
      jobType: "Tam Zamanlı",
      createdAt: "2024-04-10", 
      salary: "Asgari Ücret",
      requiredSkills: ["Servis Deneyimi", "İletişim"],
      description: "Sahil restoranımızda çalışacak tecrübeli garsonlar arıyoruz...",
      isActive: true
    },
    {
      id: 4,
      jobTitle: "Muhasebe Uzmanı",
      companyName: "XYZ Mali Müşavirlik",
      location: "Merkez",
      jobType: "Tam Zamanlı",
      createdAt: "2024-04-08",
      salary: "12.000₺ - 18.000₺",
      requiredSkills: ["Luca", "ETA", "Muhasebe Deneyimi"],
      description: "Mali müşavirlik ofisimiz için deneyimli muhasebe uzmanı arıyoruz...",
      isActive: true
    },
    {
      id: 5,
      jobTitle: "Ön Büro Elemanı",
      companyName: "Bandırma Otel",
      location: "Merkez",
      jobType: "Tam Zamanlı",
      createdAt: "2024-04-12",
      salary: "Belirtilmemiş",
      requiredSkills: ["İngilizce", "Misafir İlişkileri", "Rezervasyon Sistemleri"],
      description: "Otelimizin ön büro departmanında görevlendirilmek üzere takım arkadaşları arıyoruz...",
      isActive: true
    }
  ];

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    // LocalStorage'dan ilanları al
    const fetchJobs = () => {
      try {
        // LocalStorage'dan tüm ilanları al veya örnek verileri kullan
        let storedJobs = JSON.parse(localStorage.getItem('allJobs') || '[]');
        
        // myJobs'dan da ilanları al ve birleştir
        const myJobs = JSON.parse(localStorage.getItem('myJobs') || '[]');
        
        // Aynı ID'ye sahip ilanları önle (myJobs ilanları tercih et)
        const allJobIds = new Set(storedJobs.map(job => job.id));
        const newMyJobs = myJobs.filter(job => !allJobIds.has(job.id));
        
        if (newMyJobs.length > 0) {
          storedJobs = [...newMyJobs, ...storedJobs];
          localStorage.setItem('allJobs', JSON.stringify(storedJobs));
        }
        
        // Eğer localStorage'da hiç ilan yoksa örnek verileri kullan
        if (storedJobs.length === 0) {
          // Örnek verileri localStorage'a kaydet
          localStorage.setItem('allJobs', JSON.stringify(sampleJobs));
          storedJobs = sampleJobs;
        }
        
        // Sadece aktif ilanları göster ve en yeni ilanları başa al
        const activeJobs = storedJobs
          .filter(job => job.isActive !== false)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setRecentJobs(activeJobs);
      } catch (error) {
        console.error("İş ilanları alınırken hata:", error);
        // Hata durumunda örnek verileri göster
        setRecentJobs(sampleJobs);
      } finally {
        setLoading(false);
      }
    };

    // Yükleme efekti için kısa bir gecikme
    setTimeout(fetchJobs, 1000);
  }, []);

  return (
    <PortalLayout title="Bandırma İş Portalı">
      <div className="bg-white">
        {/* Hero section */}
        <div className="relative isolate overflow-hidden pt-14">
          <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-indigo-50 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50"></div>
          <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6">
              <div className="max-w-xl lg:max-w-lg">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Bandırma'da İş Bulmak Artık Daha Kolay
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Bandırma ve çevresindeki en güncel iş ilanlarını keşfedin. 
                  İster deneyimli bir profesyonel olun, ister kariyerinize yeni başlıyor olun, 
                  size uygun pozisyonlar burada!
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <a
                    href="#recent-jobs"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    İş İlanlarını Gör
                  </a>
                  <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
                    İşveren Olarak Kayıt Ol <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-last xl:pt-80">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
                  </div>
                </div>
                <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
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
                <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
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
              </div>
            </div>
          </div>
        </div>

        {/* Recent jobs section */}
        <div id="recent-jobs" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Güncel İş İlanları
              </h2>
              <p className="mt-2 text-lg leading-8 text-gray-600">
                Bandırma ve çevresindeki en yeni iş fırsatlarını keşfedin
              </p>
            </div>
            
            {loading ? (
              <div className="mt-16 text-center py-20">
                <div className="spinner"></div>
                <p className="mt-2 text-gray-500">İş İlanları Yükleniyor...</p>
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="mt-16 text-center py-20">
                <p className="text-gray-500">Henüz ilan bulunmuyor.</p>
              </div>
            ) : (
              <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {recentJobs.map((job) => (
                  <article key={job.id} className="flex flex-col items-start border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="w-full bg-indigo-100 p-4">
                      <div className="flex items-center gap-x-4">
                        <span className="text-xs rounded bg-indigo-600 px-2 py-1 font-medium text-white">
                          {job.jobType}
                        </span>
                        <time dateTime={job.createdAt} className="text-xs text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                        </time>
                      </div>
                      <div className="relative mt-3">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                          <a href={`/job/${job.id}`}>
                            <span className="absolute inset-0" />
                            {job.jobTitle}
                          </a>
                        </h3>
                        <p className="text-sm text-gray-600 font-medium mt-1">{job.companyName}</p>
                      </div>
                    </div>
                    <div className="w-full p-4">
                      <p className="mt-1 line-clamp-3 text-sm leading-6 text-gray-600">
                        {job.description}
                      </p>
                      <div className="mt-4 flex gap-2 flex-wrap">
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
                    <div className="w-full border-t border-gray-200 p-4 flex justify-between items-center">
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
                    <div className="w-full p-4 bg-gray-50 flex justify-center">
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

            <div className="mt-12 flex justify-center">
              <a
                href="#"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50"
              >
                Tüm İlanları Görüntüle
              </a>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default HomePage;
