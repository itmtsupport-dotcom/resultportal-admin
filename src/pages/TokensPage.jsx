import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  fetchTokens, 
  fetchStudents, 
  generateToken, 
  generateBulkTokens,
  exportTokensPdf,
  performBulkAction
} from "../services/api";
import { 
  Ticket, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Users,
  Copy,
  RefreshCw,
  Eye,
  MoreVertical,
  Trash2,
  Ban,
  PlayCircle
} from "lucide-react";

const TokensPage = () => {
  const [activeTab, setActiveTab] = useState("list"); // 'list', 'generate', 'bulk'
  
  // --- LIST STATE ---
  const [tokens, setTokens] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingList, setLoadingList] = useState(true);
  const [selectedTokenIds, setSelectedTokenIds] = useState([]);
  const [bulkActionType, setBulkActionType] = useState("");
  const [showBulkActionConfirm, setShowBulkActionConfirm] = useState(false);
  
  // --- GENERATE SINGLE STATE ---
  const [singleStudentSearch, setSingleStudentSearch] = useState("");
  const [singleStudents, setSingleStudents] = useState([]);
  const [singleSelectedStudent, setSingleSelectedStudent] = useState(null);
  const [singleExpires, setSingleExpires] = useState("90");
  const [singleMaxUsage, setSingleMaxUsage] = useState("4");
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleGenerated, setSingleGenerated] = useState(null);

  // --- GENERATE BULK STATE ---
  const [bulkCount, setBulkCount] = useState("10");
  const [bulkExpires, setBulkExpires] = useState("90");
  const [bulkMaxUsage, setBulkMaxUsage] = useState("4");
  const [bulkStudentSearch, setBulkStudentSearch] = useState("");
  const [bulkStudents, setBulkStudents] = useState([]);
  const [bulkSelectedStudent, setBulkSelectedStudent] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkGenerated, setBulkGenerated] = useState([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // --- SHARED ---
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    if (activeTab === "list") {
      loadTokens();
    }
  }, [activeTab]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // --- ACTIONS ---
  const loadTokens = async () => {
    setLoadingList(true);
    try {
      const data = await fetchTokens();
      setTokens(data || []);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to load tokens." });
    } finally {
      setLoadingList(false);
    }
  };

  const searchStudents = async (query, type) => {
    if (!query.trim()) return;
    const setLoading = type === "single" ? setSingleLoading : setBulkLoading;
    const setResults = type === "single" ? setSingleStudents : setBulkStudents;
    
    setLoading(true);
    try {
      const response = await fetchStudents({ search: query, page: 1, pageSize: 10 });
      setResults(response.items || []);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to search students." });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSingle = async (e) => {
    e.preventDefault();
    if (!singleSelectedStudent) {
      setMessage({ type: "error", text: "Please select a student." });
      return;
    }

    setSubmitting(true);
    try {
      const result = await generateToken({
        registrationNumber: singleSelectedStudent.registrationNumber,
        expiresInDays: Number(singleExpires),
        maxUsage: Number(singleMaxUsage)
      });
      setSingleGenerated(result);
      setMessage({ type: "success", text: "Token generated successfully." });
      // Reset form partially
      setSingleSelectedStudent(null);
      setSingleStudentSearch("");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Generation failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateBulk = async () => {
    setShowBulkConfirm(false);
    setSubmitting(true);
    try {
      const result = await generateBulkTokens({
        count: Number(bulkCount),
        expiresInDays: Number(bulkExpires),
        maxUsage: Number(bulkMaxUsage),
        registrationNumber: bulkSelectedStudent?.registrationNumber
      });
      setBulkGenerated(result || []);
      setMessage({ type: "success", text: `Generated ${result.length} tokens successfully.` });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Bulk generation failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const exportBulkCSV = () => {
    if (!bulkGenerated.length) return;
    
    const headers = ["Token Code", "Student Reg", "Expires At", "Max Usage", "Status"];
    const rows = bulkGenerated.map(t => [
      t.tokenCode,
      bulkSelectedStudent?.registrationNumber || "Unassigned",
      new Date(t.expiresAt).toLocaleDateString(),
      t.maxUsage,
      t.status
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bulk_tokens_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = async () => {
    if (!bulkGenerated.length) return;
    
    try {
      const response = await exportTokensPdf(bulkGenerated);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tokens-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage({ type: "success", text: "PDF downloaded successfully" });
    } catch (error) {
      console.error("Export PDF error:", error);
      setMessage({ type: "error", text: "Failed to export PDF" });
    }
  };

  const executeBulkAction = async () => {
    if (!bulkActionType || selectedTokenIds.length === 0) return;
    
    setSubmitting(true);
    setShowBulkActionConfirm(false);
    
    try {
      const result = await performBulkAction(bulkActionType, selectedTokenIds);
      setMessage({ type: "success", text: result.message });
      setSelectedTokenIds([]);
      setBulkActionType("");
      loadTokens();
    } catch (error) {
      console.error("Bulk action error:", error);
      setMessage({ type: "error", text: error.response?.data?.error || "Bulk action failed" });
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER HELPERS ---
  const filteredTokens = useMemo(() => {
    return tokens.filter(t => {
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchSearch = !search || 
        t.tokenCode.toLowerCase().includes(search.toLowerCase()) ||
        t.Student?.fullName.toLowerCase().includes(search.toLowerCase()) ||
        t.Student?.registrationNumber.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [tokens, search, statusFilter]);

  const handleSelectAll = () => {
    if (filteredTokens.length === 0) return;
    
    // Check if all visible tokens are already selected
    const allSelected = filteredTokens.every(t => selectedTokenIds.includes(t.id));
    
    if (allSelected) {
      // Deselect all visible tokens
      const visibleIds = filteredTokens.map(t => t.id);
      setSelectedTokenIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Select all visible tokens
      const visibleIds = filteredTokens.map(t => t.id);
      setSelectedTokenIds(prev => {
        const newIds = new Set([...prev, ...visibleIds]);
        return Array.from(newIds);
      });
    }
  };

  const handleSelectRow = (id) => {
    setSelectedTokenIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(tid => tid !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isAllSelected = filteredTokens.length > 0 && filteredTokens.every(t => selectedTokenIds.includes(t.id));
   const isIndeterminate = filteredTokens.length > 0 && filteredTokens.some(t => selectedTokenIds.includes(t.id)) && !isAllSelected;

   return (
     <div className="space-y-6">
      {/* Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 text-white animate-in slide-in-from-top-2 ${
          message.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Tokens</h1>
          <p className="text-gray-500 mt-1">Manage and generate result checking tokens</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Token List
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "generate" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Generate Single
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "bulk" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Bulk Generate
          </button>
        </div>
      </div>

      {/* --- LIST VIEW --- */}
      {activeTab === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Bulk Actions Toolbar */}
          {selectedTokenIds.length > 0 && (
            <div className="bg-blue-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-blue-100 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {selectedTokenIds.length}
                </span>
                <span className="text-sm font-medium text-blue-900">Selected</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBulkActionType("activate");
                    setShowBulkActionConfirm(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium shadow-sm"
                >
                  <PlayCircle size={16} /> Activate
                </button>
                <button
                  onClick={() => {
                    setBulkActionType("disable");
                    setShowBulkActionConfirm(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 text-sm font-medium shadow-sm"
                >
                  <Ban size={16} /> Disable
                </button>
                <button
                  onClick={() => {
                    setBulkActionType("delete");
                    setShowBulkActionConfirm(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium shadow-sm"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                placeholder="Search tokens, students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="EXHAUSTED">Exhausted</option>
              <option value="DISABLED">Disabled</option>
            </select>
            <button 
              onClick={loadTokens}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200"
              title="Refresh List"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={isAllSelected}
                      ref={input => { if (input) input.indeterminate = isIndeterminate }}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Token Code</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Assigned To</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Usage</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingList ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="8" className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredTokens.length > 0 ? (
                  filteredTokens.map((token, index) => (
                    <tr 
                      key={token.id} 
                      className={`hover:bg-gray-50 transition-colors ${selectedTokenIds.includes(token.id) ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedTokenIds.includes(token.id)}
                          onChange={() => handleSelectRow(token.id)}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-700">{token.tokenCode}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {token.Student ? (
                          <div>
                            <div className="font-medium text-gray-900">{token.Student.fullName}</div>
                            <div className="text-xs text-gray-500">{token.Student.registrationNumber}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          token.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                          token.status === "EXPIRED" ? "bg-orange-100 text-orange-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {token.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {token.usageCount} / {token.maxUsage}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(token.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/tokens/view/${token.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <Ticket size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>No tokens found matching your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- GENERATE SINGLE --- */}
      {activeTab === "generate" && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="text-blue-600" size={20} />
              Generate New Token
            </h2>
            
            <form onSubmit={handleGenerateSingle} className="space-y-6">
              {/* Student Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Assign to Student</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    placeholder="Search by name or reg no..."
                    value={singleStudentSearch}
                    onChange={e => setSingleStudentSearch(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <button
                    type="button"
                    onClick={() => searchStudents(singleStudentSearch, "single")}
                    disabled={singleLoading}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-sm font-medium transition-colors"
                  >
                    Search
                  </button>
                </div>
                
                {/* Search Results Dropdown */}
                {singleStudents.length > 0 && !singleSelectedStudent && (
                  <div className="border border-gray-200 rounded-lg mt-2 max-h-48 overflow-y-auto bg-white shadow-lg">
                    {singleStudents.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => {
                          setSingleSelectedStudent(s);
                          setSingleStudentSearch(`${s.fullName} (${s.registrationNumber})`);
                          setSingleStudents([]);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                      >
                        <p className="font-medium text-sm text-gray-900">{s.fullName}</p>
                        <p className="text-xs text-gray-500">{s.registrationNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {singleSelectedStudent && (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div>
                      <p className="font-medium text-blue-900">{singleSelectedStudent.fullName}</p>
                      <p className="text-xs text-blue-700">{singleSelectedStudent.registrationNumber}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setSingleSelectedStudent(null);
                        setSingleStudentSearch("");
                      }}
                      className="text-blue-500 hover:text-blue-700 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires In (Days)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    value={singleExpires}
                    onChange={e => setSingleExpires(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Usage Count</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    value={singleMaxUsage}
                    onChange={e => setSingleMaxUsage(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !singleSelectedStudent}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors"
              >
                {submitting ? "Generating..." : "Generate Token"}
              </button>
            </form>

            {/* Success Result */}
            {singleGenerated && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center animate-in fade-in zoom-in duration-300">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-green-900 mb-1">Token Generated!</h3>
                <p className="text-green-700 text-sm mb-4">The token is ready for use.</p>
                
                <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm flex items-center justify-between max-w-sm mx-auto">
                  <code className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                    {singleGenerated.tokenCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(singleGenerated.tokenCode);
                      setMessage({ type: "success", text: "Copied to clipboard" });
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors"
                    title="Copy Token"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- GENERATE BULK --- */}
      {activeTab === "bulk" && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Copy className="text-purple-600" size={20} />
                Bulk Token Generation
              </h2>
              <p className="text-gray-500 text-sm mt-1">Generate multiple tokens at once for distribution.</p>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tokens</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                    value={bulkCount}
                    onChange={e => setBulkCount(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 1000 tokens per batch</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires (Days)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                      value={bulkExpires}
                      onChange={e => setBulkExpires(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Usage</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                      value={bulkMaxUsage}
                      onChange={e => setBulkMaxUsage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Assign All to Student (Optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
                      placeholder="Search student..."
                      value={bulkStudentSearch}
                      onChange={e => setBulkStudentSearch(e.target.value)}
                    />
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <button
                      type="button"
                      onClick={() => searchStudents(bulkStudentSearch, "bulk")}
                      disabled={bulkLoading}
                      className="absolute right-1 top-1 bottom-1 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-sm font-medium transition-colors"
                    >
                      Search
                    </button>
                  </div>

                  {/* Bulk Student Results */}
                  {bulkStudents.length > 0 && !bulkSelectedStudent && (
                    <div className="border border-gray-200 rounded-lg mt-2 max-h-32 overflow-y-auto bg-white shadow-lg">
                      {bulkStudents.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => {
                            setBulkSelectedStudent(s);
                            setBulkStudentSearch(`${s.fullName} (${s.registrationNumber})`);
                            setBulkStudents([]);
                          }}
                          className="px-4 py-2 hover:bg-purple-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <p className="font-medium text-sm text-gray-900">{s.fullName}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {bulkSelectedStudent && (
                    <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-100">
                      <span className="text-sm font-medium text-purple-900">
                        Assigned to: {bulkSelectedStudent.fullName}
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          setBulkSelectedStudent(null);
                          setBulkStudentSearch("");
                        }}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowBulkConfirm(true)}
                  disabled={submitting}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Generate {bulkCount} Tokens
                </button>
              </div>

              {/* Results Section */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Output Preview</h3>
                  {bulkGenerated.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={exportBulkCSV}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        <Download size={18} />
                        Export CSV
                      </button>
                      <button
                        onClick={handleExportPdf}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        <Download size={18} />
                        Export PDF
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                  {bulkGenerated.length > 0 ? (
                    <div className="overflow-y-auto max-h-[400px]">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-gray-500 font-medium">#</th>
                            <th className="px-4 py-2 text-gray-500 font-medium">Code</th>
                            <th className="px-4 py-2 text-gray-500 font-medium">Expiry</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {bulkGenerated.map((t, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                              <td className="px-4 py-2 font-mono text-gray-800">{t.tokenCode}</td>
                              <td className="px-4 py-2 text-gray-500">{new Date(t.expiresAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                      <Copy size={48} strokeWidth={1} className="mb-2 opacity-50" />
                      <p>Generated tokens will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Generation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to generate <strong>{bulkCount} tokens</strong>?
              {bulkSelectedStudent ? (
                <span className="block mt-1 bg-purple-50 text-purple-700 p-2 rounded text-sm">
                  Assigned to: <strong>{bulkSelectedStudent.fullName}</strong>
                </span>
              ) : (
                <span className="block mt-1 text-sm text-gray-500 italic">
                  (Unassigned tokens)
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateBulk}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Yes, Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {showBulkActionConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                bulkActionType === "delete" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
              }`}>
                {bulkActionType === "delete" ? <Trash2 size={24} /> : <AlertCircle size={24} />}
              </div>
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {bulkActionType} Tokens?
              </h3>
              <p className="text-gray-600 mt-2">
                Are you sure you want to <strong>{bulkActionType}</strong> {selectedTokenIds.length} selected tokens?
                {bulkActionType === "delete" && (
                  <span className="block mt-2 text-red-600 text-sm font-medium">
                    This action cannot be undone.
                  </span>
                )}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkActionConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkAction}
                disabled={submitting}
                className={`px-4 py-2 text-white rounded-lg font-medium ${
                  bulkActionType === "delete" ? "bg-red-600 hover:bg-red-700" :
                  bulkActionType === "activate" ? "bg-green-600 hover:bg-green-700" :
                  "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {submitting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Icon Component for close button
const X = ({ size }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default TokensPage;
