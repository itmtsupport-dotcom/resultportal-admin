import React, { useState, useEffect } from "react";
import { Plus, Upload, UserPlus, X, CheckCircle, AlertCircle, FileText, Download } from "lucide-react";
import { fetchStudents, fetchDepartments, fetchClasses, createStudent, uploadStudentsCsv, downloadStudentsTemplate } from "../services/api";
import StudentSearchBar from "../components/StudentSearchBar";
import StudentTable from "../components/StudentTable";
import EmptyState from "../components/EmptyState";

const StudentsListPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    registrationNumber: "",
    email: "",
    departmentId: "",
    classId: ""
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Upload States
  const [csvFile, setCsvFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Notification
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  // Initial Data Load
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [deptData, classData] = await Promise.all([
          fetchDepartments(),
          fetchClasses()
        ]);
        setDepartments(deptData || []);
        setClasses(classData || []);
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch Students
  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        search,
        departmentId: selectedDept,
        classId: selectedClass
      };
      const response = await fetchStudents(params);
      setStudents(response.items || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadStudents();
    }, 500);

    return () => clearTimeout(timer);
  }, [page, search, selectedDept, selectedClass]);

  // Auto-clear message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handlers
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.registrationNumber || !formData.departmentId || !formData.classId) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    setSubmitting(true);
    try {
      await createStudent(formData);
      setMessage({ type: "success", text: "Student created successfully!" });
      setShowAddModal(false);
      setFormData({ fullName: "", registrationNumber: "", email: "", departmentId: "", classId: "" });
      loadStudents();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to create student." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setMessage({ type: "error", text: "Please select a CSV file." });
      return;
    }

    setUploading(true);
    setUploadResult(null);
    try {
      const result = await uploadStudentsCsv(csvFile);
      setUploadResult(result);
      if (result.imported > 0) {
        setMessage({ type: "success", text: `Successfully imported ${result.imported} students.` });
        loadStudents();
      } else if (result.errors && result.errors.length > 0) {
        setMessage({ type: "error", text: "Upload finished with errors. Please check the report." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadStudentsTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to download template." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 text-white animate-in slide-in-from-top-2 ${
          message.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">Manage student records and registrations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setCsvFile(null);
              setUploadResult(null);
              setShowUploadModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm"
          >
            <Upload size={18} />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-200"
          >
            <UserPlus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <StudentSearchBar
        search={search}
        setSearch={setSearch}
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        departments={departments}
        classes={classes}
        totalResults={students.length}
      />

      {/* Content Area */}
      {loading ? (
        <StudentTable loading={true} />
      ) : students.length > 0 ? (
        <>
          <StudentTable
            students={students}
            onEdit={(s) => console.log("Edit", s)}
            onDelete={(s) => console.log("Delete", s)}
            onView={(s) => console.log("View", s)}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No students found"
          subtitle={search ? "Try adjusting your search or filters" : "Get started by adding a new student"}
          actions={
            !search && (
              <>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Add Student
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  Import CSV
                </button>
              </>
            )
          }
        />
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Add New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="input w-full"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  className="input w-full font-mono"
                  required
                  value={formData.registrationNumber}
                  onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
                  placeholder="ITMT/CSC/0001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  className="input w-full"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    className="input w-full"
                    required
                    value={formData.departmentId}
                    onChange={e => setFormData({...formData, departmentId: e.target.value})}
                  >
                    <option value="">Select Dept</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    className="input w-full"
                    required
                    value={formData.classId}
                    onChange={e => setFormData({...formData, classId: e.target.value})}
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Import Students</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {!uploadResult ? (
                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                    <FileText className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">CSV Format Requirements</p>
                      <p>Headers: fullName, registrationNumber, email, department, class</p>
                      <button 
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="mt-2 text-blue-700 hover:text-blue-900 font-medium underline inline-flex items-center gap-1"
                      >
                        <Download size={14} /> Download Template
                      </button>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="csv-upload"
                      accept=".csv"
                      className="hidden"
                      onChange={e => setCsvFile(e.target.files[0])}
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="text-gray-400" size={32} />
                      <span className="text-gray-700 font-medium">
                        {csvFile ? csvFile.name : "Click to select CSV file"}
                      </span>
                      <span className="text-gray-400 text-sm">or drag and drop</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !csvFile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                    >
                      {uploading ? "Uploading..." : "Upload Students"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      uploadResult.imported > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}>
                      {uploadResult.imported > 0 ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Upload Complete</h4>
                    <p className="text-gray-500">Here's the summary of your import</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{uploadResult.imported}</div>
                      <div className="text-xs font-medium text-green-600 uppercase">Imported</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">{uploadResult.skipped}</div>
                      <div className="text-xs font-medium text-yellow-600 uppercase">Skipped</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">{uploadResult.errors?.length || 0}</div>
                      <div className="text-xs font-medium text-red-600 uppercase">Errors</div>
                    </div>
                  </div>

                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="font-bold text-gray-700 mb-2 sticky top-0 bg-gray-50">Error Log:</p>
                      <ul className="space-y-1">
                        {uploadResult.errors.map((err, idx) => (
                          <li key={idx} className="text-red-600 flex gap-2">
                            <span className="font-mono text-xs bg-red-100 px-1 rounded">Row {err.row}</span>
                            <span>{err.error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadResult(null);
                      setCsvFile(null);
                    }}
                    className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsListPage;
