import React from "react";
import { Users } from "lucide-react";

const EmptyState = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-6">
        <Users size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-8 max-w-md text-center text-sm leading-relaxed">{subtitle}</p>
      {actions && <div className="flex gap-4">{actions}</div>}
    </div>
  );
};

export default EmptyState;
