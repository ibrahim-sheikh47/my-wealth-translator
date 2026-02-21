import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";

const GoodMorning = () => {
  // Use 'isLoading' to match your Redux-based useAuth hook names
  const { user, isLoading } = useAuth();

  // Grab the plan status from your userProfile slice
  const { plan } = useSelector((state) => state.userProfile);

  // Helper to get initials from display name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        {/* Profile Image / Initials Circle */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden bg-[#c7a481]"
        >
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
            <span className="text-zinc-400 text-sm">Good Morning</span>
            <span style={{ color: "#c7a481" }}>👋</span>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">
              {user?.displayName || user?.firstName || "Guest"}
            </h2>
            {/* Badge for subscription plan */}
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