import { useEffect, useState } from "react";
import { fetchLogs, fetchLogStats } from "../services/api";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Info,
  Search,
  Shield,
  User,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalLogsToday: 0,
    adminActions: 0,
    studentActivities: 0,
    systemErrors: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    startDate: "",
    endDate: ""
  });
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [page, filters]); // Reload when page or filters change

  const loadStats = async () => {
    try {
      const data = await fetchLogStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load log stats", error);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchLogs({ ...filters, page });
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to load logs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" /> Success</span>;
      case "Failed":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} className="mr-1" /> Failed</span>;
      case "Warning":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle size={12} className="mr-1" /> Warning</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"><Info size={12} className="mr-1" /> Info</span>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto pr-4 ${selectedLog ? 'w-2/3' : 'w-full'}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
          <p className="text-gray-500">Monitor system activities and security events.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Logs Today</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLogsToday}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Activity size={20} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Admin Actions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.adminActions}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Shield size={20} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Student Activities</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.studentActivities}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <User size={20} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">System Errors</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.systemErrors}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                placeholder="Search logs..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              >
                <option value="">All Categories</option>
                <option value="Authentication">Authentication</option>
                <option value="Admin Action">Admin Action</option>
                <option value="Student Activity">Student Activity</option>
                <option value="System Error">System Error</option>
                <option value="Payment">Payment</option>
              </select>
            </div>
            <div>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
                <option value="Warning">Warning</option>
                <option value="Info">Info</option>
              </select>
            </div>
            <div>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center mb-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                      Loading logs...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className={`cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {log.eventType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.eventCategory}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{log.userName || "System"}</span>
                          <span className="text-xs text-gray-400">{log.userType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>No logs found matching your criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedLog && (
        <div className="w-96 bg-white border-l border-gray-200 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-300 fixed right-0 top-0 h-full z-50 pt-16">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">Log Details</h2>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Info</span>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(selectedLog.status)}
                    <span className="text-sm text-gray-500">{formatDate(selectedLog.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{selectedLog.eventType}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedLog.description}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User Details</span>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="text-sm font-medium text-gray-900">{selectedLog.userName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">ID</span>
                    <span className="text-sm font-mono text-gray-900">{selectedLog.userId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="text-sm font-medium text-gray-900">{selectedLog.userType}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Technical Details</span>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">IP Address</span>
                    <span className="text-sm font-mono text-gray-900">{selectedLog.ipAddress || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Device</span>
                    <span className="text-sm text-gray-900 text-right truncate max-w-[200px]" title={selectedLog.deviceInfo}>
                      {selectedLog.deviceInfo || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedLog.metadata && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Metadata</span>
                  <div className="mt-2 p-3 bg-gray-900 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
