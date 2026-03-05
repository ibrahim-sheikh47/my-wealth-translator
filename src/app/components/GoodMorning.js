import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const GoodMorning = () => {
  const { user, isLoading } = useAuth();
  const { plan } = useSelector((state) => state.userProfile);
  const router = useRouter();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div className="flex items-center justify-between mb-8 border-b-[#c7a48190] pb-10 border-b">
      <div
        className="flex items-center gap-3 cursor-pointer group "
        onClick={handleProfileClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleProfileClick()}
        aria-label="Go to profile"
      >
        {/* Profile Image / Initials Circle */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden bg-[#c7a481] ring-2 ring-transparent group-hover:ring-[#c7a481]/60 transition-all duration-200 ">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{getInitials(user?.displayName || user?.firstName)}</span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-sm">Hi There,</span>
            <span style={{ color: "#c7a481" }}>👋</span>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white group-hover:text-[#c7a481] transition-colors duration-200">
              {user?.displayName || user?.firstName || "Guest"}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c7a481]/20 text-[#c7a481] border border-[#c7a481]/30 uppercase font-bold">
              {plan}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodMorning;