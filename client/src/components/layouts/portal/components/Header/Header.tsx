import { useState } from "react";
import {
  Bars3Icon,
  DocumentDuplicateIcon,
  HomeIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  BookmarkIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "@/providers";
import { Dialog } from "@headlessui/react";
import ProfileAvatar from "./ProfileAvatar";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user, isEmployer, isJobSeeker } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);

  // İşveren için menü öğeleri
  const employerLinks = [
    { name: "Ana Sayfa", href: "/", icon: HomeIcon },
    { name: "İlanlarım", href: "/my-jobs", icon: BriefcaseIcon },
    { name: "İlan Ekle", href: "/post-job", icon: DocumentDuplicateIcon },
    { name: "Mesajlar", href: "/messages", icon: ChatBubbleLeftRightIcon },
  ];

  // İş arayan için menü öğeleri
  const jobSeekerLinks = [
    { name: "Ana Sayfa", href: "/", icon: HomeIcon },
    { name: "Başvurularım", href: "/my-applications", icon: DocumentDuplicateIcon },
    { name: "Kaydedilen İlanlar", href: "/saved-jobs", icon: BookmarkIcon },
    { name: "Mesajlar", href: "/messages", icon: ChatBubbleLeftRightIcon },
  ];

  // Kullanıcı tipine göre doğru menüyü seç
  const isEmployerValue = isEmployer();
  const isJobSeekerValue = isJobSeeker();
  const storedUserRole = localStorage.getItem("user_role");
  
  // Kullanıcı tipi kontrolüne göre menüyü belirle
  // Öncelik sırasına göre kontrol ediyoruz
  let navigation = [];
  
  // StorageService'den okunan rol daha güvenilir, önce onu kontrol edelim
  if (storedUserRole === "employer") {
    navigation = employerLinks;
  } else if (storedUserRole === "jobseeker") {
    navigation = jobSeekerLinks;
  }
  // localStorage'da rol yoksa veya unknown ise, isEmployer/isJobSeeker fonksiyonlarını kullan
  else if (isEmployerValue) {
    navigation = employerLinks;
  } else if (isJobSeekerValue) {
    navigation = jobSeekerLinks;
  } else {
    // Varsayılan olarak iş arayan menüsü göster
    navigation = jobSeekerLinks;
  }
  
  return (
    <header className="shrink-0 border-b border-gray-200 bg-white sticky top-0 z-10">
      <nav
        className="mx-auto flex items-center justify-between p-3 sm:p-4 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Logo />
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-semibold leading-6 text-gray-900 flex items-center gap-x-2 ${
                window.location.pathname === item.href
                  ? "text-indigo-600"
                  : "hover:text-indigo-600"
              }`}
            >
              {item.icon && <item.icon className="h-5 w-5" />}
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {isAuthenticated ? (
            <ProfileAvatar logout={logout} />
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Giriş Yap <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile menu - slide in from right */}
      <Dialog
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50 bg-black/20" aria-hidden="true" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-4 py-5 sm:max-w-sm sm:px-6 sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Job Portal</span>
              <Logo />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-1 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`-mx-3 flex items-center rounded-lg px-3 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 ${
                      window.location.pathname === item.href
                        ? "bg-gray-50 text-indigo-600"
                        : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="h-6 w-6 mr-3 text-indigo-600 flex-shrink-0" />}
                    {item.name}
                  </Link>
                ))}
              </div>
              {isAuthenticated ? (
                <div className="py-6">
                  <Link
                    to="/profile"
                    className="-mx-3 flex items-center rounded-lg px-3 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-indigo-600 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    Profilim
                  </Link>
                  <button
                    className="-mx-3 flex w-full items-center rounded-lg px-3 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 text-left"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-indigo-600 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                    Çıkış
                  </button>
                </div>
              ) : (
                <div className="py-6">
                  <Link
                    to="/login"
                    className="-mx-3 flex items-center rounded-lg px-3 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-indigo-600 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="-mx-3 flex items-center rounded-lg px-3 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-indigo-600 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                    </svg>
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default Header;


