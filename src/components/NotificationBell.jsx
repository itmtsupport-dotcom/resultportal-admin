import React, { useState, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { fetchNotifications, markNotificationAsRead } from "../services/api";
import { Bell, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const { unreadCount, refreshCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadRecent();
    }
  }, [isOpen]);

  const loadRecent = async () => {
    try {
      const data = await fetchNotifications({ page: 1, pageSize: 5 });
      setRecentNotifications(data.items);
    } catch (error) {
      console.error("Failed to load recent notifications", error);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setRecentNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      refreshCount();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button 
              onClick={() => {
                navigate("/notifications");
                setIsOpen(false);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                    onClick={() => {
                      // Maybe navigate to entity?
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        notification.type === 'RESULT_UPLOAD' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'STUDENT_CREATED' ? 'bg-green-100 text-green-800' :
                        notification.type === 'TOKEN_GENERATED' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <CheckCircle size={12} /> Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg text-center">
            <button 
              onClick={() => {
                setIsOpen(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Backdrop to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
