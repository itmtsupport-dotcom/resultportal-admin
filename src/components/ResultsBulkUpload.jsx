import React, { useState } from "react";
import {
  downloadBulkResultsCsvTemplate,
  downloadBulkResultsExcelTemplate,
  uploadBulkResults
} from "../services/api";
import { Upload, FileSpreadsheet, FileText, Download, CheckCircle, AlertCircle } from "lucide-react";

const ResultsBulkUpload = () => {
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
        type: type === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = type === "excel" ? "bulk-results-template.xlsx" : "bulk-results-template.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Unable to download template file.");
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSummary(null);

    try {
      const response = await uploadBulkResults(file);
      setSummary(response);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload bulk results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-2">Bulk Result Upload</h3>
        <p className="text-gray-500 mb-6 text-sm">
          Upload multiple student results at once using a CSV or Excel file. 
          Please download the template first to ensure correct formatting.
        </p>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleDownload("csv")}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileText size={20} className="text-green-600" />
            <span className="font-medium text-gray-700">Download CSV Template</span>
          </button>
          <button
            onClick={() => handleDownload("excel")}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileSpreadsheet size={20} className="text-green-600" />
            <span className="font-medium text-gray-700">Download Excel Template</span>
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload size={40} className="text-gray-400 mb-3" />
              <p className="text-lg font-medium text-gray-700">
                {file ? file.name : "Click to select or drag file here"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: .csv, .xlsx
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Upload Failed</p>
                <p className="text-sm mt-1 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {summary && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3 text-green-700">
              <CheckCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Upload Successful</p>
                <p className="text-sm mt-1 opacity-90">
                  Processed {summary.totalRows || 0} rows. 
                  Created {summary.createdResults || 0} results.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !file}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Upload Results"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResultsBulkUpload;
