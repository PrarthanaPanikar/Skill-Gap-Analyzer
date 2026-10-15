import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Nav from "./components/Nav";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Analyze from "./pages/Analyze";

function Gate({ children, needsTarget = false }: { children: JSX.Element; needsTarget?: boolean }) {
  const { ready, signedIn, target } = useAuth();
  if (!ready) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1D2E]">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#3B6EF8]/30 border-t-[#3B6EF8]" />
        <p className="text-sm text-[#7FA3B8]">Loading…</p>
      </div>
    </div>
  );
  if (!signedIn) return <Navigate to="/login" replace />;
  if (needsTarget && !target) return <Navigate to="/onboarding" replace />;
  return (
    <>
      <Nav />
      {children}
    </>
  );
}

function Landing() {
  const { signedIn, target } = useAuth();
  return <Navigate to={!signedIn ? "/login" : target ? "/analyze" : "/onboarding"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Gate><Onboarding /></Gate>} />
          <Route path="/analyze" element={<Gate needsTarget><Analyze /></Gate>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
