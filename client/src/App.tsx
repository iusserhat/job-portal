import { lazy } from "react";
import HomePage from "@/pages/HomePage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppWrapper from "./AppWrapper";
import { useAuth } from "./providers";
import JobDetailPage from "./pages/JobDetailPage";
import JobApplicationsPage from "./pages/JobApplicationsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";

const LoginPage = lazy(() => import("@/pages/AuthPages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/AuthPages/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/AuthPages/ForgotPasswordPage")
);
const MyJobsPage = lazy(() => import("@/pages/MyJobsPage"));
const SavedJobsPage = lazy(() => import("@/pages/SavedJobsPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const PostJobPage = lazy(() => import("@/pages/PostJobPage"));

// İşveren erişim kontrolü için özel bileşen
const EmployerRoute = ({ element }) => {
  const { isEmployer } = useAuth();
  
  // Kullanıcı işveren değilse ana sayfaya yönlendir
  if (!isEmployer()) {
    console.log("İşveren olmayan kullanıcı işveren sayfasına erişmeye çalıştı, yönlendiriliyor");
    return <Navigate to="/" replace />;
  }
  
  // İşveren ise sayfayı göster
  return element;
};

function App() {
  const { isAuthenticated, isEmployer } = useAuth();
  
  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Routes>
          <Route path="/" element={<AppWrapper />}>
            <Route index element={<HomePage />} />
            
            {/* İşveren sayfaları (sadece işveren rolüne sahip kullanıcılar erişebilir) */}
            <Route path="/my-jobs" element={<EmployerRoute element={<MyJobsPage />} />} />
            <Route path="/post-job" element={<EmployerRoute element={<PostJobPage />} />} />
            <Route path="/job-applications/:jobId" element={<EmployerRoute element={<JobApplicationsPage />} />} />
            
            {/* İş arayan sayfaları */}
            {!isEmployer() && <Route path="/saved-jobs" element={<SavedJobsPage />} />}
            {!isEmployer() && <Route path="/my-applications" element={<MyApplicationsPage />} />}
            
            {/* Ortak sayfalar */}
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/job/:id" element={<JobDetailPage />} />
            
            {/* Yönlendirmeler */}
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/register" element={<Navigate to="/" />} />
            <Route path="/forgot-password" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<AppWrapper />}>
            <Route index element={<HomePage />} />
            <Route path="/job/:id" element={<JobDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
