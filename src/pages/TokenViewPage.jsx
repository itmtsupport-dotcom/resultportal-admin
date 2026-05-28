import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  disableToken,
  extendTokenExpiry,
  fetchTokenDetail,
  resetTokenUsage,
  deleteToken
} from "../services/api";
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  RotateCcw,
  Trash2,
  Ban,
  Plus
} from "lucide-react";

const TokenViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [extraDays, setExtraDays] = useState("30");
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    let active = true;
    const loadToken = async () => {
      setLoading(true);
      setNotice(null);
      try {
        const data = await fetchTokenDetail(id);
        if (!active) return;
        setToken(data);
        setLogs(data.TokenUsageLogs || data.tokenUsageLogs || []);
      } catch (error) {
        if (!active) return;
        setNotice({ type: "error", text: error?.response?.data?.error || "Unable to load token." });
      } finally {
        if (active) setLoading(false);
      }
    };
    loadToken();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const handleDisable = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await disableToken(token.id);
      setToken(updated);
      setNotice({ type: "success", text: "Token disabled successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error?.response?.data?.error || "Unable to disable token." });
    } finally {
      setSaving(false);
    }
  };

  const handleExtendExpiry = async (event) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const updated = await extendTokenExpiry(token.id, Number(extraDays));
      setToken(updated);
      setNotice({ type: "success", text: "Expiry extended successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error?.response?.data?.error || "Unable to extend token expiry." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetUsage = async () => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to reset usage count to 0?")) return;
    
    setSaving(true);
    try {
      const updated = await resetTokenUsage(token.id);
      setToken(updated);
      setNotice({ type: "success", text: "Token usage reset successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error?.response?.data?.error || "Unable to reset usage." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this token? This cannot be undone.")) return;

    setSaving(true);
    try {
      await deleteToken(token.id);
      navigate("/tokens/list");
    } catch (error) {
      setNotice({ type: "error", text: error?.response?.data?.error || "Unable to delete token." });
      setSaving(false);
    }
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "—";
    
  const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString() : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">Token Not Found</h2>
        <Link to="/tokens/list" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Tokens List
        </Link>
      </div>
    );
  }

  const usagePercent = Math.min(Math.round((token.usageCount / token.maxUsage) * 100), 100);
  
  const statusColor = 
    token.status === "ACTIVE" ? "bg-green-100 text-green-800" :
    token.status === "EXHAUSTED" ? "bg-gray-100 text-gray-800" :
    "bg-red-100 text-red-800";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notice && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 text-white animate-in slide-in-from-top-2 ${
          notice.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {notice.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{notice.text}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
          <span>/</span>
          <Link to="/tokens/list" className="hover:text-gray-900">Tokens</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Token Details</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Token Details</h1>
            <p className="text-gray-500 mt-1">Manage token lifecycle and usage history</p>
          </div>
          <Link 
            to="/tokens/list" 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to List
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Token Code */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Token Code</p>
              <h3 className="text-xl font-mono font-bold text-gray-900 mt-1">{token.tokenCode}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard size={20} />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-2 ${statusColor}`}>
                {token.status}
              </span>
            </div>
            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Usage</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{token.usageCount} <span className="text-sm text-gray-400 font-normal">/ {token.maxUsage}</span></h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${usagePercent >= 100 ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Expiry */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Expiry Date</p>
              <h3 className="text-lg font-bold text-gray-900 mt-1">{formatDate(token.expiresAt)}</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Calendar size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Student Info */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            Assigned Student
          </h3>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl border-2 border-white shadow-sm">
              {token.Student?.fullName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="font-medium text-gray-900">{token.Student?.fullName || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="font-mono text-gray-900">{token.Student?.registrationNumber || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{token.Student?.Department?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium text-gray-900">{token.Student?.Class?.name || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Token Controls */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Token Controls</h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                value={extraDays}
                onChange={(e) => setExtraDays(e.target.value)}
                placeholder="Days"
              />
              <button 
                onClick={handleExtendExpiry}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Extend
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDisable}
                disabled={saving || token.status === "DISABLED"}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Ban size={16} /> Disable
              </button>
              
              <button
                onClick={handleResetUsage}
                disabled={saving || token.usageCount === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
            
            <button
              onClick={handleDelete}
              disabled={saving}
              className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete Token Permanently
            </button>
          </div>
        </div>
      </div>

      {/* Usage History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Token Usage History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date Used</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Exam</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Result</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {formatDateTime(log.usedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {log.Year?.name || log.year?.name || log.Session?.name || log.session?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.Exam?.name || log.exam?.name || log.Semester?.name || log.semester?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.Class?.name || log.class?.name || log.level || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.Result?.id ? (
                        <Link 
                          to={`/results/view/${log.Result.id}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Result
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.success ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                      }`}>
                        {log.success ? "Success" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Clock size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No usage history available for this token.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TokenViewPage;
