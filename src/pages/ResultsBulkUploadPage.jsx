import { useState } from "react";
import {
  downloadBulkResultsCsvTemplate,
  downloadBulkResultsExcelTemplate,
  uploadBulkResults
} from "../services/api";

const ResultsBulkUploadPage = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (type) => {
    setDownloading(true);
    setError("");
    try {
      const response =
        type === "excel"
          ? await downloadBulkResultsExcelTemplate()
          : await downloadBulkResultsCsvTemplate();
      const blob = new Blob([response.data], {
        type:
          type === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        type === "excel"
          ? "bulk-results-template.xlsx"
          : "bulk-results-template.csv";
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
      setError("Please select a CSV or Excel file to upload.");
      return;
    }
    setLoading(true);
    setError("");
    setSummary(null);
    try {
      const response = await uploadBulkResults(file);
      setSummary(response);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to upload result file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Bulk Result Upload</h2>
      <p>Upload a CSV or Excel file to create results in bulk.</p>
      <div className="toolbar">
        <button
          className="button secondary"
          type="button"
          onClick={() => handleDownload("csv")}
          disabled={downloading}
        >
          Download CSV Template
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => handleDownload("excel")}
          disabled={downloading}
        >
          Download Excel Template
        </button>
      </div>
      <p className="helper-text text-sm text-gray-500 mt-2">
        Please use the provided template format to avoid upload errors.
      </p>
      <form className="upload-form" onSubmit={handleUpload}>
        <input
          className="input"
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={(event) => setFile(event.target.files[0] || null)}
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </form>
      {error ? <div className="notice">{error}</div> : null}
      {summary ? (
        <div className="card sub-card">
          <h3>Import Summary</h3>
          <div className="summary-grid">
            <div>
              <span className="stat-label">Successful Records</span>
              <div className="stat-value">{summary.successfulRecords || 0}</div>
            </div>
            <div>
              <span className="stat-label">Skipped Rows</span>
              <div className="stat-value">{summary.skippedRows || 0}</div>
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

export default ResultsBulkUploadPage;
