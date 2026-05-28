import React, { useState, useEffect } from "react";
import {
  fetchCourses,
  fetchDepartments,
  fetchClasses,
  createCourse,
  updateCourse,
  deleteCourse
} from "../services/api";
import { Search, Plus, Edit2, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    units: "3",
    departmentId: "",
    classId: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, deptsData, classesData] = await Promise.all([
        fetchCourses(selectedDept),
        fetchDepartments(),
        fetchClasses()
      ]);
      setCourses(coursesData || []);
      setDepartments(deptsData || []);
      setClasses(classesData || []);
    } catch (err) {
      console.error("Failed to load data", err);
      setMessage({ type: "error", text: "Failed to load courses." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({ name: "", units: "3", departmentId: "", classId: "" });
    setIsModalOpen(true);
    setMessage(null);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      units: course.units,
      departmentId: course.departmentId,
      classId: course.classId
    });
    setIsModalOpen(true);
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(id);
      setMessage({ type: "success", text: "Course deleted successfully." });
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to delete course." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.departmentId || !formData.classId) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
        setMessage({ type: "success", text: "Course updated successfully!" });
      } else {
        await createCourse(formData);
        setMessage({ type: "success", text: "Course created successfully!" });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Operation failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 text-white ${
          message.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search courses..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-48"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} /> Add Course
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Course Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Units</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : filteredCourses.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No courses found.</td></tr>
            ) : (
              filteredCourses.map(course => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{course.name}</td>
                  <td className="px-6 py-3 text-gray-600">{course.Class?.name || "-"}</td>
                  <td className="px-6 py-3 text-gray-600">{course.Department?.name || "-"}</td>
                  <td className="px-6 py-3 text-gray-600">{course.units}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(course)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCourse ? "Edit Course" : "Create New Course"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && message.type === "error" && (
                <div className="p-3 bg-red-50 text-red-700 rounded text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Introduction to Computer Science"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  className="input"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    className="input"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    required
                  >
                    <option value="">Select Dept</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
