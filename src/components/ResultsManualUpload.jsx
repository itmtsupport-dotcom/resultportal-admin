import React, { useState, useEffect } from "react";
import {
  fetchDepartments,
  fetchYears,
  fetchExams,
  fetchClasses,
  fetchCourses,
  fetchStudents,
  createManualResult
} from "../services/api";
import { Search, Plus, Trash, CheckCircle, AlertCircle } from "lucide-react";

const ResultsManualUpload = () => {
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    departmentId: "",
    yearId: "",
    examId: "",
    classId: ""
  });

  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [courseRows, setCourseRows] = useState([{ courseId: "", score: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [deptData, yearData, examData, classData] = await Promise.all([
          fetchDepartments(),
          fetchYears(),
          fetchExams(),
          fetchClasses()
        ]);
        setDepartments(deptData || []);
        setYears(yearData || []);
        setExams(examData || []);
        setClasses(classData || []);
      } catch (err) {
        setError("Failed to load dropdown options.");
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (form.departmentId && form.classId) {
      const loadCourses = async () => {
        try {
          const data = await fetchCourses(form.departmentId, form.classId);
          setCourses(data || []);
        } catch (err) {
          console.error("Failed to load courses", err);
        }
      };
      loadCourses();
    } else {
      setCourses([]);
    }
  }, [form.departmentId, form.classId]);

  const handleStudentSearch = async () => {
    if (!studentSearch.trim()) return;
    setLoadingStudents(true);
    try {
      const response = await fetchStudents({ search: studentSearch, page: 1, pageSize: 10 });
      setStudents(response.items || []);
    } catch (err) {
      console.error("Student search failed", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(`${student.fullName} (${student.registrationNumber})`);
    setStudents([]);
    // Auto-select department if possible
    if (!form.departmentId && student.department) {
       const dept = departments.find(d => d.name === student.department);
       if(dept) setForm(prev => ({ ...prev, departmentId: dept.id }));
    }
  };

  const handleCourseRowChange = (index, field, value) => {
    const updated = [...courseRows];
    updated[index][field] = value;
    setCourseRows(updated);
  };

  const addCourseRow = () => {
    setCourseRows([...courseRows, { courseId: "", score: "" }]);
  };

  const removeCourseRow = (index) => {
    const updated = courseRows.filter((_, i) => i !== index);
    setCourseRows(updated);
  };

  const calculateGrade = (score) => {
    const num = Number(score);
    if (!score || isNaN(num)) return "-";
    if (num >= 70) return "A";
    if (num >= 60) return "B";
    if (num >= 50) return "C";
    if (num >= 45) return "D";
    if (num >= 40) return "E";
    return "F";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError("Please search and select a student.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess(null);

    try {
      const payload = {
        studentId: selectedStudent.id,
        departmentId: form.departmentId,
        yearId: form.yearId,
        examId: form.examId,
        classId: form.classId,
        courses: courseRows.map(row => ({
          courseId: row.courseId,
          score: Number(row.score)
        }))
      };
      
      console.log("Submitting payload:", payload);


      await createManualResult(payload);
      setSuccess("Result uploaded successfully!");
      setCourseRows([{ courseId: "", score: "" }]);
      setSelectedStudent(null);
      setStudentSearch("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload result.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus className="text-blue-600" size={20} />
          Upload Result Manually
        </h3>
        
        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 mb-6 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metadata Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                value={form.yearId}
                onChange={(e) => setForm({ ...form, yearId: e.target.value })}
                required
              >
                <option value="">Select Year</option>
                {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                value={form.examId}
                onChange={(e) => setForm({ ...form, examId: e.target.value })}
                required
              >
                <option value="">Select Exam</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                required
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Student Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="Search by Registration Number or Name"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              <button
                type="button"
                onClick={handleStudentSearch}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loadingStudents}
              >
                <Search size={20} className="text-gray-600" />
              </button>
            </div>
            
            {students.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {students.map(student => (
                  <div
                    key={student.id}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => selectStudent(student)}
                  >
                    <p className="font-medium text-gray-900">{student.fullName}</p>
                    <p className="text-sm text-gray-500">{student.registrationNumber}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course Scores */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Course Scores</label>
              <button
                type="button"
                onClick={addCourseRow}
                className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                <Plus size={16} /> Add Course
              </button>
            </div>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              {courseRows.map((row, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
                      value={row.courseId}
                      onChange={(e) => handleCourseRowChange(index, "courseId", e.target.value)}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      placeholder="Score"
                      min="0"
                      max="100"
                      value={row.score}
                      onChange={(e) => handleCourseRowChange(index, "score", e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-12 flex items-center justify-center h-[42px] bg-white border border-gray-200 rounded-lg font-bold text-gray-600 shadow-sm">
                    {calculateGrade(row.score)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCourseRow(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors h-[42px] w-[42px] flex items-center justify-center"
                    disabled={courseRows.length === 1}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
            >
              {submitting ? "Uploading..." : "Submit Result"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResultsManualUpload;
