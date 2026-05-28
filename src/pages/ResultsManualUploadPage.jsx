import { useEffect, useMemo, useState } from "react";
import {
  createManualResult,
  fetchCourses,
  fetchDepartments,
  fetchLevels,
  fetchSemesters,
  fetchSessions,
  fetchStudents
} from "../services/api";

const ResultsManualUploadPage = () => {
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    departmentId: "",
    sessionId: "",
    semesterId: "",
    level: ""
  });
  const [courseRows, setCourseRows] = useState([
    { courseId: "", score: "" }
  ]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const formatter = useMemo(() => new Intl.NumberFormat(), []);

  useEffect(() => {
    let active = true;
    const loadOptions = async () => {
      setLoadingOptions(true);
      setError("");
      try {
        const [departmentData, sessionData, semesterData, levelData] =
          await Promise.all([
            fetchDepartments(),
            fetchSessions(),
            fetchSemesters(),
            fetchLevels()
          ]);
        if (!active) {
          return;
        }
        setDepartments(departmentData || []);
        setSessions(sessionData || []);
        setSemesters(semesterData || []);
        setLevels(levelData || []);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(
          err?.response?.data?.error || "Unable to load dropdown data."
        );
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    };
    loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!form.departmentId) {
      setCourses([]);
      return () => {
        active = false;
      };
    }
    const loadCourses = async () => {
      setLoadingCourses(true);
      setError("");
      try {
        const data = await fetchCourses(form.departmentId);
        if (!active) {
          return;
        }
        setCourses(data || []);
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.error || "Unable to load courses.");
        }
      } finally {
        if (active) {
          setLoadingCourses(false);
        }
      }
    };
    loadCourses();
    return () => {
      active = false;
    };
  }, [form.departmentId]);

  const handleStudentSearch = async (event) => {
    event.preventDefault();
    if (!studentSearch.trim()) {
      return;
    }
    setLoadingStudents(true);
    setError("");
    try {
      const response = await fetchStudents({
        search: studentSearch.trim(),
        page: 1,
        pageSize: 20
      });
      setStudents(response.items || []);
    } catch (err) {
      setError(
        err?.response?.data?.error || "Unable to load students list."
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(student.registrationNumber);
  };

  const handleFormChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const updateCourseRow = (index, field, value) => {
    setCourseRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addCourseRow = () => {
    setCourseRows((prev) => [...prev, { courseId: "", score: "" }]);
  };

  const removeCourseRow = (index) => {
    setCourseRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(null);
    try {
      const payload = {
        registrationNumber: selectedStudent?.registrationNumber || "",
        departmentId: form.departmentId,
        sessionId: form.sessionId,
        semesterId: form.semesterId,
        level: form.level,
        courses: courseRows
          .filter((row) => row.courseId && row.score !== "")
          .map((row) => ({
            courseId: row.courseId,
            score: Number(row.score)
          }))
      };
      const response = await createManualResult(payload);
      setSuccess(response);
      setCourseRows([{ courseId: "", score: "" }]);
    } catch (err) {
      setError(
        err?.response?.data?.error || "Unable to submit manual result."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const courseTotal = courseRows.filter((row) => row.courseId).length;

  return (
    <div className="card">
      <div className="page-header">
        <div>
          <h2>Manual Result Upload</h2>
          <p>Enter individual student results and courses.</p>
        </div>
        <div className="stat-chip">
          {formatter.format(courseTotal)} courses selected
        </div>
      </div>
      {error ? <div className="notice">{error}</div> : null}
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="stat-label" htmlFor="department">
            Department
          </label>
          <select
            id="department"
            className="input"
            value={form.departmentId}
            onChange={handleFormChange("departmentId")}
            disabled={loadingOptions}
          >
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label className="stat-label" htmlFor="session">
            Session
          </label>
          <select
            id="session"
            className="input"
            value={form.sessionId}
            onChange={handleFormChange("sessionId")}
            disabled={loadingOptions}
          >
            <option value="">Select session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label className="stat-label" htmlFor="semester">
            Semester
          </label>
          <select
            id="semester"
            className="input"
            value={form.semesterId}
            onChange={handleFormChange("semesterId")}
            disabled={loadingOptions}
          >
            <option value="">Select semester</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label className="stat-label" htmlFor="level">
            Level
          </label>
          <select
            id="level"
            className="input"
            value={form.level}
            onChange={handleFormChange("level")}
            disabled={loadingOptions}
          >
            <option value="">Select level</option>
            {levels.map((level) => (
              <option key={level.id} value={level.name}>
                {level.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row span-2">
          <label className="stat-label" htmlFor="student-search">
            Student
          </label>
          <div className="inline-form">
            <input
              id="student-search"
              className="input"
              type="text"
              placeholder="Search student by name or registration number"
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
            />
            <button
              className="button secondary"
              type="button"
              onClick={handleStudentSearch}
              disabled={loadingStudents}
            >
              {loadingStudents ? "Searching..." : "Search"}
            </button>
          </div>
          {selectedStudent ? (
            <div className="helper">
              Selected: {selectedStudent.fullName} (
              {selectedStudent.registrationNumber})
            </div>
          ) : null}
          {students.length ? (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Registration Number</th>
                    <th>Department</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.fullName}</td>
                      <td>{student.registrationNumber}</td>
                      <td>{student.department || "—"}</td>
                      <td className="table-actions">
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => handleSelectStudent(student)}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        <div className="form-row span-2">
          <div className="section-header">
            <h3>Courses</h3>
            <button
              className="button secondary"
              type="button"
              onClick={addCourseRow}
              disabled={loadingCourses}
            >
              Add Course
            </button>
          </div>
          <div className="course-list">
            {courseRows.map((row, index) => (
              <div className="course-row" key={`${row.courseId}-${index}`}>
                <select
                  className="input"
                  value={row.courseId}
                  onChange={(event) =>
                    updateCourseRow(index, "courseId", event.target.value)
                  }
                  disabled={loadingCourses || !form.departmentId}
                >
                  <option value="">
                    {loadingCourses ? "Loading courses..." : "Select course"}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseTitle}
                    </option>
                  ))}
                </select>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Score"
                  value={row.score}
                  onChange={(event) =>
                    updateCourseRow(index, "score", event.target.value)
                  }
                />
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => removeCourseRow(index)}
                  disabled={courseRows.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-actions span-2">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Result"}
          </button>
          {success ? (
            <div className="helper">
              Result created with ID: {success.id}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default ResultsManualUploadPage;
