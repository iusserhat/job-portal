import { lazy, useEffect } from "react";
import HomePage from "@/pages/HomePage";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import AppWrapper from "./AppWrapper";
import { useAuth } from "./providers";
import JobDetailPage from "./pages/JobDetailPage";
import JobApplicationsPage from "./pages/JobApplicationsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import StorageService from "./core/storage.service";

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/pages/AuthPages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/AuthPages/RegisterPage"));
const MyJobsPage = lazy(() => import("@/pages/MyJobsPage"));
const PostJobPage = lazy(() => import("@/pages/PostJobPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

function App() {
  const { login, isAuthenticated, isEmployer, isJobSeeker, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // URL'den token kontrolü
  useEffect(() => {
    const checkURLToken = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const userParam = params.get("user");

        // URL'de token ve user parametreleri varsa
        if (token && userParam && !isAuthenticated) {
          console.log("URL'den token bulundu, oturum başlatılıyor...");
          
          try {
            // URL'den gelen kullanıcı verisini parse et
            const userData = JSON.parse(decodeURIComponent(userParam));
            
            // AuthProvider ile giriş yap
            login(token, userData);
            
            // Parametreleri temizle ve yönlendir
            navigate(location.pathname, { replace: true });
            
            console.log("URL token ile oturum başlatıldı, parametreler temizlendi");
          } catch (parseError) {
            console.error("URL user parametresi parse edilemedi:", parseError);
          }
        }
      } catch (error) {
        console.error("URL token kontrolünde hata:", error);
      }
    };

    checkURLToken();
  }, [location, login, navigate, isAuthenticated]);
  
  // Kullanıcı tipi bilgilerini logla
  console.log("App - Kullanıcı bilgileri:", {
    isAuthenticated,
    isEmployer: isAuthenticated ? isEmployer() : null,
    isJobSeeker: isAuthenticated ? isJobSeeker() : null,
    userType: user?.user_type_id
  });

  return (
    <Routes>
      <Route path="/" element={<AppWrapper />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="my-jobs"
          element={
            <RequireAuth>
              <RequireEmployer>
                <MyJobsPage />
              </RequireEmployer>
            </RequireAuth>
          }
        />
        <Route
          path="post-job"
          element={
            <RequireAuth>
              <RequireEmployer>
                <PostJobPage />
              </RequireEmployer>
            </RequireAuth>
          }
        />
        <Route
          path="job-applications/:jobId"
          element={
            <RequireAuth>
              <RequireEmployer>
                <JobApplicationsPage />
              </RequireEmployer>
            </RequireAuth>
          }
        />
        <Route
          path="my-applications"
          element={
            <RequireAuth>
              <RequireJobSeeker>
                <MyApplicationsPage />
              </RequireJobSeeker>
            </RequireAuth>
          }
        />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        {/* Public routes */}
        <Route path="job/:id" element={<JobDetailPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

// Kimlik doğrulama gerektiren route'lar için wrapper
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// İşveren rolü gerektiren route'lar için wrapper
function RequireEmployer({ children }: { children: JSX.Element }) {
  const { isEmployer } = useAuth();
  
  if (!isEmployer()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// İş arayan rolü gerektiren route'lar için wrapper
function RequireJobSeeker({ children }: { children: JSX.Element }) {
  const { isJobSeeker } = useAuth();
  
  if (!isJobSeeker()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
