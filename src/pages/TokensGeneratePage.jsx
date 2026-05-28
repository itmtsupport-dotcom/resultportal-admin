import { useState } from "react";
import { fetchStudents, generateToken, generateBulkTokens } from "../services/api";

const TokensGeneratePage = () => {
  const [activeTab, setActiveTab] = useState("single");

  // Single Token State
  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [expiresInDays, setExpiresInDays] = useState("90");
  const [maxUsage, setMaxUsage] = useState("4");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [notice, setNotice] = useState("");

  // Bulk Token State
  const [bulkCount, setBulkCount] = useState("10");
  const [bulkExpires, setBulkExpires] = useState("90");
  const [bulkMaxUsage, setBulkMaxUsage] = useState("4");
  const [bulkStudentSearch, setBulkStudentSearch] = useState("");
  const [bulkStudents, setBulkStudents] = useState([]);
  const [bulkSelectedStudent, setBulkSelectedStudent] = useState(null);
  const [loadingBulkStudents, setLoadingBulkStudents] = useState(false);
  const [bulkGeneratedTokens, setBulkGeneratedTokens] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bulkNotice, setBulkNotice] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Single Token Handlers
  const handleStudentSearch = async (event) => {
    event.preventDefault();
    if (!studentSearch.trim()) return;
    setLoadingStudents(true);
    setNotice("");
    try {
      const response = await fetchStudents({
        search: studentSearch.trim(),
        page: 1,
        pageSize: 20
      });
      setStudents(response.items || []);
    } catch (error) {
      setNotice(error?.response?.data?.error || "Unable to load students list.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(student.registrationNumber);
    setStudents([]);
  };

  const handleGenerateToken = async (event) => {
    event.preventDefault();
    if (!selectedStudent) {
      setNotice("Select a student before generating a token.");
      return;
    }
    setSubmitting(true);
    setNotice("");
    setGeneratedToken(null);
    try {
      const response = await generateToken({
        registrationNumber: selectedStudent.registrationNumber,
        expiresInDays: Number(expiresInDays),
        maxUsage: Number(maxUsage)
      });
      setGeneratedToken(response);
    } catch (error) {
      setNotice(error?.response?.data?.error || "Unable to generate token.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyToken = async () => {
    if (!generatedToken?.tokenCode) return;
    try {
      await navigator.clipboard.writeText(generatedToken.tokenCode);
      setNotice("Token copied to clipboard.");
    } catch {
      setNotice("Unable to copy token. Please copy manually.");
    }
  };

  // Bulk Token Handlers
  const handleBulkStudentSearch = async (event) => {
    event.preventDefault();
    if (!bulkStudentSearch.trim()) return;
    setLoadingBulkStudents(true);
    setBulkNotice("");
    try {
      const response = await fetchStudents({
        search: bulkStudentSearch.trim(),
        page: 1,
        pageSize: 20
      });
      setBulkStudents(response.items || []);
    } catch (error) {
      setBulkNotice(error?.response?.data?.error || "Unable to load students list.");
    } finally {
      setLoadingBulkStudents(false);
    }
  };

  const handleSelectBulkStudent = (student) => {
    setBulkSelectedStudent(student);
    setBulkStudentSearch(student.registrationNumber);
    setBulkStudents([]);
  };

  const handleBulkGenerateConfirm = (event) => {
    event.preventDefault();
    setShowConfirmModal(true);
  };

  const handleBulkGenerate = async () => {
    setShowConfirmModal(false);
    setBulkSubmitting(true);
    setBulkNotice("");
    setBulkGeneratedTokens([]);
    try {
      const response = await generateBulkTokens({
        count: Number(bulkCount),
        expiresInDays: Number(bulkExpires),
        maxUsage: Number(bulkMaxUsage),
        registrationNumber: bulkSelectedStudent?.registrationNumber
      });
      setBulkGeneratedTokens(response || []);
      setBulkNotice(`Successfully generated ${response.length} tokens.`);
    } catch (error) {
      setBulkNotice(error?.response?.data?.error || "Unable to generate bulk tokens.");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (bulkGeneratedTokens.length === 0) return;
    
    const headers = ["Token Code", "Student Reg", "Expires At", "Max Usage", "Status"];
    const rows = bulkGeneratedTokens.map(token => [
      token.tokenCode,
      bulkSelectedStudent?.registrationNumber || "Unassigned",
      new Date(token.expiresAt).toLocaleDateString(),
      token.maxUsage,
      token.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bulk_tokens_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "single"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("single")}
        >
          Single Token
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "bulk"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("bulk")}
        >
          Bulk Generation
        </button>
      </div>

      {activeTab === "single" ? (
        <>
          <div className="page-header">
            <div>
              <h2>Generate Single Token</h2>
              <p>Create a result access token for a specific student.</p>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Search Student</label>
            <div className="search-bar">
              <input
                className="input"
                type="text"
                placeholder="Enter registration number or name..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              <button
                className="button secondary"
                type="button"
                onClick={handleStudentSearch}
                disabled={loadingStudents}
              >
                Search
              </button>
            </div>
            {students.length > 0 && (
              <ul className="dropdown-list">
                {students.map((student) => (
                  <li
                    key={student.id}
                    className="dropdown-item"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <strong>{student.fullName}</strong> ({student.registrationNumber})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleGenerateToken} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Expires In (Days)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Max Usage</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value)}
                  required
                />
              </div>
            </div>

            {notice && <div className="p-3 bg-blue-50 text-blue-700 rounded text-sm">{notice}</div>}

            <button
              className="button w-full"
              type="submit"
              disabled={submitting || !selectedStudent}
            >
              {submitting ? "Generating..." : "Generate Token"}
            </button>
          </form>

          {generatedToken && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Token Generated Successfully!</h3>
              <div className="flex items-center justify-between bg-white p-3 rounded border border-green-100">
                <code className="text-xl font-mono font-bold text-gray-800 tracking-wider">
                  {generatedToken.tokenCode}
                </code>
                <button
                  onClick={handleCopyToken}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Copy
                </button>
              </div>
              <div className="mt-3 text-sm text-green-700 grid grid-cols-2 gap-2">
                <p><strong>Expires:</strong> {new Date(generatedToken.expiresAt).toLocaleDateString()}</p>
                <p><strong>Max Usage:</strong> {generatedToken.maxUsage} times</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="page-header">
            <div>
              <h2>Bulk Token Generation</h2>
              <p>Generate multiple tokens at once for distribution.</p>
            </div>
          </div>

          <form onSubmit={handleBulkGenerateConfirm} className="space-y-4">
            <div className="form-group">
              <label className="label">Number of Tokens</label>
              <input
                className="input"
                type="number"
                min="1"
                max="1000"
                value={bulkCount}
                onChange={(e) => setBulkCount(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Expires In (Days)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={bulkExpires}
                  onChange={(e) => setBulkExpires(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Max Usage</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={bulkMaxUsage}
                  onChange={(e) => setBulkMaxUsage(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Assign to Student (Optional)</label>
              <div className="search-bar">
                <input
                  className="input"
                  type="text"
                  placeholder="Leave empty for unassigned tokens..."
                  value={bulkStudentSearch}
                  onChange={(e) => setBulkStudentSearch(e.target.value)}
                />
                <button
                  className="button secondary"
                  type="button"
                  onClick={handleBulkStudentSearch}
                  disabled={loadingBulkStudents}
                >
                  Search
                </button>
              </div>
              {bulkStudents.length > 0 && (
                <ul className="dropdown-list">
                  {bulkStudents.map((student) => (
                    <li
                      key={student.id}
                      className="dropdown-item"
                      onClick={() => handleSelectBulkStudent(student)}
                    >
                      <strong>{student.fullName}</strong> ({student.registrationNumber})
                    </li>
                  ))}
                </ul>
              )}
              {bulkSelectedStudent && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  Selected: {bulkSelectedStudent.fullName} ({bulkSelectedStudent.registrationNumber})
                  <button 
                    type="button"
                    onClick={() => {
                      setBulkSelectedStudent(null);
                      setBulkStudentSearch("");
                    }}
                    className="ml-2 text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <button
              className="button w-full bg-blue-600 text-white hover:bg-blue-700"
              type="submit"
              disabled={bulkSubmitting}
            >
              {bulkSubmitting ? "Processing..." : "Generate Tokens"}
            </button>
          </form>

          {bulkNotice && <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">{bulkNotice}</div>}

          {bulkGeneratedTokens.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Generated Tokens</h3>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                >
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 font-medium text-gray-500">Token Code</th>
                      <th className="p-3 font-medium text-gray-500">Expires</th>
                      <th className="p-3 font-medium text-gray-500">Max Usage</th>
                      <th className="p-3 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bulkGeneratedTokens.slice(0, 10).map((token) => (
                      <tr key={token.tokenCode}>
                        <td className="p-3 font-mono text-gray-800">{token.tokenCode}</td>
                        <td className="p-3 text-gray-600">{new Date(token.expiresAt).toLocaleDateString()}</td>
                        <td className="p-3 text-gray-600">{token.maxUsage}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {token.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bulkGeneratedTokens.length > 10 && (
                  <div className="p-3 text-center text-gray-500 text-xs bg-gray-50">
                    Showing first 10 of {bulkGeneratedTokens.length} tokens. Export to see all.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-bold mb-2">Confirm Generation</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to generate <strong>{bulkCount}</strong> tokens?
                  {bulkSelectedStudent && (
                    <span className="block mt-1">
                      Assigned to: <strong>{bulkSelectedStudent.fullName}</strong>
                    </span>
                  )}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkGenerate}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TokensGeneratePage;
