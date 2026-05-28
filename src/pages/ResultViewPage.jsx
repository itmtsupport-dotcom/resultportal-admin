import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchResultDetail,
  fetchResultEditLogs,
  fetchResultPdf,
  updateResultItemScore
} from "../services/api";

const ResultViewPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [scoreEdits, setScoreEdits] = useState({});
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const formatter = useMemo(() => new Intl.NumberFormat(), []);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [detail, editLogs] = await Promise.all([
          fetchResultDetail(id),
          fetchResultEditLogs(id)
        ]);
        if (!active) {
          return;
        }
        setResult(detail);
        setLogs(editLogs || []);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err?.response?.data?.error || "Unable to load result details.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleScoreChange = (itemId, value) => {
    setScoreEdits((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSaveScore = async (itemId) => {
    const scoreValue = scoreEdits[itemId];
    if (scoreValue === undefined || scoreValue === "") {
      return;
    }
    setSavingId(itemId);
    setError("");
    try {
      const response = await updateResultItemScore(itemId, Number(scoreValue));
      setResult((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? { ...item, score: response.score, grade: response.grade }
            : item
        )
      }));
      setScoreEdits((prev) => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
      const updatedLogs = await fetchResultEditLogs(id);
      setLogs(updatedLogs || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to update score.");
    } finally {
      setSavingId(null);
    }
  };

  const handlePreviewPdf = async () => {
    setPdfLoading(true);
    setError("");
    try {
      const response = await fetchResultPdf(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl((prev) => {
        if (prev) {
          window.URL.revokeObjectURL(prev);
        }
        return url;
      });
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to load PDF preview.");
    } finally {
      setPdfLoading(false);
    }
  };

  const renderDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "—";

  return (
    <div className="page-section">
      <div className="card">
        <div className="page-header">
          <div>
            <h2>Result Details</h2>
            <p>Review and manage submitted scores.</p>
          </div>
          <div className="stat-chip">
            {formatter.format(result?.items?.length || 0)} courses
          </div>
        </div>
        {error ? <div className="notice">{error}</div> : null}
        {loading ? (
          <p>Loading result details...</p>
        ) : result ? (
          <div className="profile-grid">
            <div>
              <span className="stat-label">Student</span>
              <div className="stat-value">{result.student?.fullName}</div>
              <div className="helper">
                {result.student?.registrationNumber}
              </div>
            </div>
            <div>
              <span className="stat-label">Department</span>
              <div className="stat-value">{result.department?.name}</div>
            </div>
            <div>
              <span className="stat-label">Session</span>
              <div className="stat-value">{result.session?.name}</div>
            </div>
            <div>
              <span className="stat-label">Semester</span>
              <div className="stat-value">{result.semester?.name}</div>
            </div>
            <div>
              <span className="stat-label">Level</span>
              <div className="stat-value">{result.level}</div>
            </div>
            <div>
              <span className="stat-label">Verification Code</span>
              <div className="stat-value">{result.verificationCode || "—"}</div>
            </div>
            <div>
              <span className="stat-label">Issued At</span>
              <div className="stat-value">{renderDate(result.issuedAt)}</div>
            </div>
          </div>
        ) : (
          <p>No result record found.</p>
        )}
      </div>

      <div className="card">
        <div className="section-header">
          <h3>Scores</h3>
          <button
            className="button secondary"
            type="button"
            onClick={handlePreviewPdf}
            disabled={pdfLoading}
          >
            {pdfLoading ? "Loading PDF..." : "Preview PDF"}
          </button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Score</th>
                <th>Grade</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading scores...</td>
                </tr>
              ) : result?.items?.length ? (
                result.items.map((item) => {
                  const draftScore =
                    scoreEdits[item.id] !== undefined
                      ? scoreEdits[item.id]
                      : item.score;
                  return (
                    <tr key={item.id}>
                      <td>{item.courseCode}</td>
                      <td>{item.courseTitle}</td>
                      <td>
                        <input
                          className="input input-compact"
                          type="number"
                          min="0"
                          max="100"
                          value={draftScore}
                          onChange={(event) =>
                            handleScoreChange(item.id, event.target.value)
                          }
                        />
                      </td>
                      <td>{item.grade}</td>
                      <td className="table-actions">
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => handleSaveScore(item.id)}
                          disabled={savingId === item.id}
                        >
                          {savingId === item.id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5">No scores available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pdfUrl ? (
          <div className="pdf-preview">
            <iframe title="Result PDF Preview" src={pdfUrl} />
          </div>
        ) : null}
      </div>

      <div className="card">
        <h3>Edit Logs</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Old</th>
                <th>New</th>
                <th>Edited By</th>
                <th>Edited At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading logs...</td>
                </tr>
              ) : logs.length ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.fieldChanged}</td>
                    <td>{log.oldValue ?? "—"}</td>
                    <td>{log.newValue ?? "—"}</td>
                    <td>{log.adminName || log.adminEmail || "—"}</td>
                    <td>{renderDate(log.editedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No edit logs available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultViewPage;
