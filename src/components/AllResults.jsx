import React, { useState, useEffect } from "react";
import {
  fetchResults,
  fetchDepartments,
  fetchClasses,
  fetchYears,
  fetchExams,
  fetchResultDetail,
  updateResult
} from "../services/api";
import { Search, Eye, Filter, ChevronLeft, ChevronRight, X, FileText, Edit2, Save, AlertCircle } from "lucide-react";

const AllResults = () => {
  // Data States
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter Options
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [exams, setExams] = useState([]);

  // Query Params
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    departmentId: "",
    classId: "",
    yearId: "",
    examId: ""
  });

  // Modal State
  const [selectedResult, setSelectedResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Load Filter Options on Mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [deptData, classData, yearData, examData] = await Promise.all([
          fetchDepartments(),
          fetchClasses(),
          fetchYears(),
          fetchExams()
        ]);
        setDepartments(deptData || []);
        setClasses(classData || []);
        setYears(yearData || []);
        setExams(examData || []);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    loadOptions();
  }, []);

  // Load Results when dependencies change
  const loadResults = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize: 20,
        search,
        ...filters
      };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === "") delete params[key];
      });

      const data = await fetchResults(params);
      setResults(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error("Failed to load results", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadResults();
    }, 500);

    return () => clearTimeout(timer);
  }, [page, search, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleViewResult = async (resultId) => {
    setLoadingDetail(true);
    setIsModalOpen(true);
    try {
      const data = await fetchResultDetail(resultId);
      setSelectedResult(data);
    } catch (err) {
      console.error("Failed to load result details", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEditClick = (result) => {
    setEditingId(result.id);
    setEditForm({
      departmentId: result.departmentId,
      classId: result.classId,
      yearId: result.yearId,
      examId: result.examId
    });
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateResult(editingId, editForm);
      
      // Update local state
      setResults(results.map(r => r.id === editingId ? updated : r));
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update result", err);
      setSaveError(err.response?.data?.error || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleEditFormChange = (key, value) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">All Results</h3>
          <p className="text-sm text-gray-500">View and manage all uploaded results</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              placeholder="Search by student name or registration number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
            value={filters.departmentId}
            onChange={(e) => handleFilterChange("departmentId", e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
            value={filters.classId}
            onChange={(e) => handleFilterChange("classId", e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
            value={filters.yearId}
            onChange={(e) => handleFilterChange("yearId", e.target.value)}
          >
            <option value="">All Years</option>
            {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
            value={filters.examId}
            onChange={(e) => handleFilterChange("examId", e.target.value)}
          >
            <option value="">All Exams</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg. Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    Loading results...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No results found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                results.map((result) => {
                  const isEditing = editingId === result.id;
                  
                  return (
                    <tr key={result.id} className={`hover:bg-gray-50 ${isEditing ? "bg-blue-50/50" : ""}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.Student?.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.Student?.registrationNumber || "N/A"}
                      </td>
                      
                      {/* Department */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditing ? (
                          <select
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
                            value={editForm.departmentId || ""}
                            onChange={(e) => handleEditFormChange("departmentId", e.target.value)}
                          >
                            <option value="" disabled>Select</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        ) : (
                          result.Department?.name || "N/A"
                        )}
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditing ? (
                          <select
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
                            value={editForm.classId || ""}
                            onChange={(e) => handleEditFormChange("classId", e.target.value)}
                          >
                            <option value="" disabled>Select</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (
                          result.Class?.name || "N/A"
                        )}
                      </td>

                      {/* Year */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditing ? (
                          <select
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
                            value={editForm.yearId || ""}
                            onChange={(e) => handleEditFormChange("yearId", e.target.value)}
                          >
                            <option value="" disabled>Select</option>
                            {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                          </select>
                        ) : (
                          result.Year?.name || "N/A"
                        )}
                      </td>

                      {/* Exam */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditing ? (
                          <select
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
                            value={editForm.examId || ""}
                            onChange={(e) => handleEditFormChange("examId", e.target.value)}
                          >
                            <option value="" disabled>Select</option>
                            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                        ) : (
                          result.Exam?.name || "N/A"
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {result.coursesCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 items-center">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Save"
                              >
                                <Save size={18} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(result)}
                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleViewResult(result.id)}
                                className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                            </>
                          )}
                        </div>
                        {isEditing && saveError && (
                          <div className="absolute right-0 mt-2 p-2 bg-red-100 text-red-700 text-xs rounded shadow-lg z-10 w-48 text-left">
                            {saveError}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{results.length > 0 ? (page - 1) * 20 + 1 : 0}</span> to <span className="font-medium">{Math.min(page * 20, total)}</span> of <span className="font-medium">{total}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Result Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
              <h3 className="text-lg font-bold text-gray-900">Result Details</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {loadingDetail ? (
                <div className="text-center py-12 text-gray-500">Loading details...</div>
              ) : selectedResult ? (
                <div className="space-y-6">
                  {/* Student Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Student Name</p>
                      <p className="text-lg font-bold text-gray-900">{selectedResult.student?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Registration Number</p>
                      <p className="text-lg font-bold text-gray-900">{selectedResult.student?.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Department</p>
                      <p className="font-medium text-gray-900">{selectedResult.department?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Class</p>
                      <p className="font-medium text-gray-900">{selectedResult.class?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Year</p>
                      <p className="font-medium text-gray-900">{selectedResult.year?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Exam</p>
                      <p className="font-medium text-gray-900">{selectedResult.exam?.name}</p>
                    </div>
                  </div>

                  {/* Course Table */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Course List</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course Title</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {selectedResult.items?.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.courseCode || "-"}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.courseTitle || "-"}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-center font-bold">{item.score}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-center font-bold text-blue-600">{item.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-red-500">Failed to load result details</div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllResults;
