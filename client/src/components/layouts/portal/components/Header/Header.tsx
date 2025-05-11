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
        className="mx-auto flex items-center justify-between p-6 lg:px-8"
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
        <div className="hidden lg:flex lg:gap-x-12">
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
              {item.icon && <item.icon className="h-6 w-6" />}
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

      {/* Mobile menu */}
      <Dialog
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
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
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              {isAuthenticated ? (
                <div className="py-6">
                  <Link
                    to="/profile"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profilim
                  </Link>
                  <button
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 w-full text-left"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Çıkış
                  </button>
                </div>
              ) : (
                <div className="py-6">
                  <Link
                    to="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
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


