import { useState } from "react";
import { IUserAccount } from "@/interfaces/models";
import { useAuth } from "@/providers";

interface DebugInfoProps {
  user: IUserAccount | null;
  isEmployer: boolean;
}

// MongoDB ObjectId kontrolü için yardımcı fonksiyon
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const DebugInfo = ({ user, isEmployer }: DebugInfoProps) => {
  const [expanded, setExpanded] = useState(false);
  const { isJobSeeker } = user ? useAuth() : { isJobSeeker: () => false };
  const isJobSeekerValue = isJobSeeker();
  const storedUserRole = localStorage.getItem("user_role") || "Bilinmiyor";
  
  return (
    <div className="bg-gray-100 p-2 text-xs text-gray-500">
      <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <strong>Debug Bilgileri</strong> - 
        Kullanıcı türü: {user?.user_type_id || "N/A"} | 
        Rol: {storedUserRole} | 
        İşveren mi: {isEmployer ? "Evet" : "Hayır"} | 
        İş Arayan mı: {isJobSeekerValue ? "Evet" : "Hayır"} {expanded ? "▲" : "▼"}
      </div>
      
      {expanded && (
        <div className="mt-2 p-2 bg-gray-200 rounded text-xs">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify({
              user: user || "Kullanıcı bilgisi yok",
              isValidObjectId: user?.user_type_id ? isValidObjectId(String(user.user_type_id)) : false,
              isEmployer: isEmployer,
              isJobSeeker: isJobSeekerValue,
              storedUserRole,
              localStorage: {
                token: localStorage.getItem("access_token") ? "✓ (var)" : "✗ (yok)",
                user_data: localStorage.getItem("user_data") 
                  ? JSON.parse(localStorage.getItem("user_data") || "{}")
                  : "Veri yok"
              }
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugInfo; 