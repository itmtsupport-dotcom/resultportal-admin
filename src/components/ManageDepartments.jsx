import React, { useState, useEffect } from "react";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from "../services/api";
import { Plus, Edit2, Trash2, X, Building } from "lucide-react";

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptName, setDeptName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error("Failed to load departments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingDept(null);
    setDeptName("");
    setIsModalOpen(true);
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This may affect students and courses linked to this department.")) return;
    try {
      await deleteDepartment(id);
      loadData();
    } catch (err) {
      alert("Failed to delete department.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    setSubmitting(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, { name: deptName });
      } else {
        await createDepartment({ name: deptName });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Departments</h3>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-500 col-span-2 text-center py-8">Loading...</p>
        ) : departments.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-8">No departments found.</p>
        ) : (
          departments.map(dept => (
            <div key={dept.id} className="card flex justify-between items-center group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Building size={20} />
                </div>
                <span className="font-medium text-gray-900">{dept.name}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(dept)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDept ? "Edit Department" : "New Department"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Computer Science"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
