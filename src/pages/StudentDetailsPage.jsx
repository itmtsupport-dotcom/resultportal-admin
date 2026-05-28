import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchStudentProfile,
  fetchStudentResults,
  fetchStudentTokens,
  fetchStudentTokenUsageLogs
} from "../services/api";

const StudentDetailsPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [profileData, resultsData, tokensData, logsData] =
          await Promise.all([
            fetchStudentProfile(id),
            fetchStudentResults(id),
            fetchStudentTokens(id),
            fetchStudentTokenUsageLogs(id)
          ]);
        if (!active) {
          return;
        }
        setProfile(profileData);
        setResults(resultsData || []);
        setTokens(tokensData || []);
        setUsageLogs(logsData || []);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(
          err?.response?.data?.error || "Unable to load student details."
        );
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

  const renderStatus = (value) => (
    <span className={`badge ${String(value || "").toLowerCase() || "neutral"}`}>
      {value || "Unknown"}
    </span>
  );

  return (
    <div className="page-section">
      <div className="card">
        <h2>Student Profile</h2>
        {error ? <div className="notice">{error}</div> : null}
        {loading ? (
          <p>Loading student profile...</p>
        ) : profile ? (
          <div className="profile-grid">
            <div>
              <span className="stat-label">Full Name</span>
              <div className="stat-value">{profile.fullName}</div>
            </div>
            <div>
              <span className="stat-label">Registration Number</span>
              <div className="stat-value">{profile.registrationNumber}</div>
            </div>
            <div>
              <span className="stat-label">Email</span>
              <div className="stat-value">{profile.email}</div>
            </div>
            <div>
              <span className="stat-label">Department</span>
              <div className="stat-value">{profile.department || "—"}</div>
            </div>
            <div>
              <span className="stat-label">Level</span>
              <div className="stat-value">{profile.level}</div>
            </div>
          </div>
        ) : (
          <p>No profile found.</p>
        )}
      </div>
      <div className="card">
        <h2>Results</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Semester</th>
                <th>Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">Loading results...</td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="4">No results available.</td>
                </tr>
              ) : (
                results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.session || "—"}</td>
                    <td>{result.semester || "—"}</td>
                    <td>{result.level}</td>
                    <td>{renderStatus(result.published ? "Published" : "Draft")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h2>Tokens</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Token Code</th>
                <th>Status</th>
                <th>Usage</th>
                <th>Expires At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">Loading tokens...</td>
                </tr>
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan="4">No tokens available.</td>
                </tr>
              ) : (
                tokens.map((token) => (
                  <tr key={token.id}>
                    <td>{token.tokenCode}</td>
                    <td>{renderStatus(token.status)}</td>
                    <td>
                      {token.usageCount} / {token.maxUsage}
                    </td>
                    <td>{token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h2>Token Usage Logs</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Token Code</th>
                <th>Result</th>
                <th>Session</th>
                <th>Semester</th>
                <th>Level</th>
                <th>Status</th>
                <th>Used At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading usage logs...</td>
                </tr>
              ) : usageLogs.length === 0 ? (
                <tr>
                  <td colSpan="7">No usage logs available.</td>
                </tr>
              ) : (
                usageLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.tokenCode || "—"}</td>
                    <td>{log.resultId ? "Available" : "Not found"}</td>
                    <td>{log.session || "—"}</td>
                    <td>{log.semester || "—"}</td>
                    <td>{log.level}</td>
                    <td>{renderStatus(log.success ? "Success" : "Failed")}</td>
                    <td>{log.usedAt ? new Date(log.usedAt).toLocaleString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsPage;
