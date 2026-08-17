import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();

  // 1. Loading state handle karein (Warna screen flicker hogi)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Agar user logged in nahi hai
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Agar user role match nahi karta (Security Check)
  // Example: Student Admin ke page par jane ki koshish kare
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}