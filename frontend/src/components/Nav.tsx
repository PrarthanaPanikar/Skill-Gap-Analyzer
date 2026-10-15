import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Nav() {
  const { name, signOut } = useAuth();
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1E3D55] bg-[#0B1D2E]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center" aria-label="SkillGap home">
          <Logo variant="lockup" size={32} />
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            to="/analyze"
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              pathname === "/analyze"
                ? "bg-[#162F42] text-[#E8F1F6]"
                : "text-[#7FA3B8] hover:text-[#E8F1F6]"
            }`}
          >
            Analyze
          </Link>
          <Link
            to="/onboarding"
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              pathname === "/onboarding"
                ? "bg-[#162F42] text-[#E8F1F6]"
                : "text-[#7FA3B8] hover:text-[#E8F1F6]"
            }`}
          >
            Settings
          </Link>
        </div>

        {/* User + sign-out */}
        <div className="flex items-center gap-3">
          {name && (
            <span className="hidden text-sm text-[#7FA3B8] sm:block">
              {name.split(" ")[0]}
            </span>
          )}
          <button
            onClick={signOut}
            className="rounded-lg border border-[#1E3D55] px-3.5 py-1.5 text-xs font-medium text-[#7FA3B8] transition-all hover:border-[#3B6EF8] hover:text-[#E8F1F6]"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
