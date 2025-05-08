import { lazy } from "react";
import HomePage from "@/pages/HomePage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppWrapper from "./AppWrapper";
import { useAuth } from "./providers";

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
const JobDetailPage = lazy(() => import("@/pages/JobDetailPage"));
const JobApplicationsPage = lazy(() => import("@/pages/JobApplicationsPage"));
const MyApplicationsPage = lazy(() => import("@/pages/MyApplicationsPage"));

function App() {
  const { isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Routes>
          <Route path="/" element={<AppWrapper />}>
            <Route index element={<HomePage />} />
            <Route path="/my-jobs" element={<MyJobsPage />} />
            <Route path="/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/post-job" element={<PostJobPage />} />
            <Route path="/job/:id" element={<JobDetailPage />} />
            <Route path="/job-applications/:jobId" element={<JobApplicationsPage />} />
            <Route path="/my-applications" element={<MyApplicationsPage />} />
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
