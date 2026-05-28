import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Ticket,
  CreditCard,
  BarChart2,
  Settings,
  FileText,
  Bell,
  Award,
  X,
  LogOut,
  MessageSquare
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../hooks/useAuth";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Students", path: "/students/list" },
    { icon: GraduationCap, label: "Results", path: "/results" },
    { icon: Ticket, label: "Tokens", path: "/tokens/list" },
    { icon: CreditCard, label: "Payments", path: "/payments" },
    { icon: BarChart2, label: "Analytics", path: "/analytics" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Award, label: "Certificates", path: "/certificates" },
    { icon: MessageSquare, label: "Chatbot KB", path: "/chatbot-kb" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: FileText, label: "Logs", path: "/logs" },
  ];

  const sidebarClasses = clsx(
    "fixed top-0 left-0 h-full bg-[#111827] text-white transition-transform duration-300 z-50 flex flex-col w-64 shadow-xl",
    {
      "translate-x-0": !isMobile || isOpen,
      "-translate-x-full": isMobile && !isOpen,
    }
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-[#0f1522]">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="text-lg text-white">U</span>
            </div>
            <span className="text-gray-100">Admin</span>
          </div>
          {isMobile && (
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                  {
                    "bg-pink-700 text-white shadow-lg shadow-pink-900/30": isActive,
                    "text-gray-400 hover:bg-gray-800 hover:text-pink-100": !isActive,
                  }
                )
              }
            >
              <item.icon
                size={20}
                className={clsx("transition-colors", {
                  "text-white": location.pathname.startsWith(item.path),
                  "text-gray-400 group-hover:text-pink-400": !location.pathname.startsWith(item.path),
                })}
              />
              <span className="font-medium text-sm">{item.label}</span>
              
              {/* Active Indicator Strip */}
              {location.pathname.startsWith(item.path) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-pink-400 rounded-r-full" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-800 bg-[#0f1522]">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-3 text-red-400 hover:bg-red-900/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
