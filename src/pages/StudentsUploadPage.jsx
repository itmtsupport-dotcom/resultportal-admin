import { useState } from "react";
import { downloadStudentsTemplate, uploadStudentsCsv } from "../services/api";

const StudentsUploadPage = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError("");
    try {
      const response = await downloadStudentsTemplate();
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "students-upload-template.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err?.response?.data?.error || "Unable to download template file."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }
    setLoading(true);
    setError("");
    setSummary(null);
    try {
      const response = await uploadStudentsCsv(file);
      setSummary(response);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to upload student file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Upload Students</h2>
      <p>Import students in bulk using the provided CSV template.</p>
      <div className="toolbar">
        <button
          className="button secondary"
          type="button"
          onClick={handleDownloadTemplate}
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "Download Sample Template"}
        </button>
      </div>
      <form className="upload-form" onSubmit={handleUpload}>
        <input
          className="input"
          type="file"
          accept=".csv"
          onChange={(event) => setFile(event.target.files[0] || null)}
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload CSV"}
        </button>
      </form>
      {error ? <div className="notice">{error}</div> : null}
      {summary ? (
        <div className="card sub-card">
          <h3>Upload Summary</h3>
          <div className="summary-grid">
            <div>
              <span className="stat-label">Total Uploaded</span>
              <div className="stat-value">{summary.totalUploaded || 0}</div>
            </div>
            <div>
              <span className="stat-label">Skipped Duplicates</span>
              <div className="stat-value">{summary.skippedDuplicates || 0}</div>
            </div>
            <div>
              <span className="stat-label">Errors</span>
              <div className="stat-value">{summary.errors?.length || 0}</div>
            </div>
          </div>
          {summary.errors?.length ? (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.errors.map((item) => (
                    <tr key={`${item.row}-${item.error}`}>
                      <td>{item.row}</td>
                      <td>{item.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default StudentsUploadPage;
