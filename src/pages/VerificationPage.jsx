import { useState } from "react";
import { verifyResultCode } from "../services/api";

const VerificationPage = () => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);
  const [details, setDetails] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!code.trim()) {
      setNotice("Enter a verification code to continue.");
      return;
    }
    setLoading(true);
    setNotice("");
    setDetails(null);
    setStatus(null);
    try {
      const response = await verifyResultCode(code.trim());
      setStatus(response.status || "INVALID");
      if (response.status === "VALID") {
        setDetails(response);
      }
    } catch (error) {
      setNotice(error?.response?.data?.error || "Unable to verify code.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "—";

  return (
    <div className="page-section">
      <div className="card verification-card">
        <div className="page-header">
          <div>
            <h2>Verification</h2>
            <p>Validate result verification codes.</p>
          </div>
        </div>
        {notice ? <div className="notice">{notice}</div> : null}
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Checking..." : "Submit"}
          </button>
        </form>
        {status ? (
          <div className="verification-status">
            <span className={`badge ${status === "VALID" ? "success" : "failed"}`}>
              {status}
            </span>
            <span className="helper">
              {status === "VALID"
                ? "This result is valid and was issued by the institution."
                : "No record matches this verification code."}
            </span>
          </div>
        ) : null}
      </div>

      {status === "VALID" && details ? (
        <div className="card verification-card">
          <h3>Result Details</h3>
          <div className="profile-grid">
            <div>
              <span className="stat-label">Student</span>
              <div className="stat-value">{details.studentName}</div>
              <div className="helper">{details.registrationNumber}</div>
            </div>
            <div>
              <span className="stat-label">Session</span>
              <div className="stat-value">{details.session}</div>
            </div>
            <div>
              <span className="stat-label">Semester</span>
              <div className="stat-value">{details.semester}</div>
            </div>
            <div>
              <span className="stat-label">Level</span>
              <div className="stat-value">{details.level}</div>
            </div>
            <div>
              <span className="stat-label">Issued At</span>
              <div className="stat-value">{formatDate(details.issuedAt)}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VerificationPage;
