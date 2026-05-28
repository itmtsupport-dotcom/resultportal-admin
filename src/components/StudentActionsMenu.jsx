import React from "react";
import { Eye, Edit2, Trash2, MoreVertical } from "lucide-react";

const StudentActionsMenu = ({ onEdit, onDelete, onView }) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onView}
        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye size={18} />
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        title="Edit Student"
      >
        <Edit2 size={18} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete Student"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default StudentActionsMenu;
