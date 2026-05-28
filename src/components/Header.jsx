import React from "react";
import { Menu } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 fixed top-0 right-0 left-0 lg:left-64 z-30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name || "Admin User"}</p>
            <p className="text-xs text-gray-500">{user?.email || "azdigitalsacademy@gmail.com"}</p>
          </div>
          <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border border-blue-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
