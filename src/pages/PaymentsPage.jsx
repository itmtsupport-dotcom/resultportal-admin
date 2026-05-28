import React, { useState, useEffect } from "react";
import { 
  fetchPayments, 
  fetchPaymentStats, 
  fetchPaymentDetails, 
  fetchDepartments, 
  fetchYears, 
  fetchClasses 
} from "../services/api";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  X,
  Calendar
} from "lucide-react";

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    failedPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  
  // Filters
  const [departmentId, setDepartmentId] = useState("");
  const [classId, setClassId] = useState("");
  const [yearId, setYearId] = useState("");
  const [status, setStatus] = useState("");
  
  // Dropdown Data
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);

  // Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDropdowns();
    loadStats();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [page, search, departmentId, classId, yearId, status]);

  const loadDropdowns = async () => {
    try {
      const [deptData, yearData, classData] = await Promise.all([
        fetchDepartments(),
        fetchYears(),
        fetchClasses()
      ]);
      setDepartments(deptData);
      setYears(yearData);
      setClasses(classData);
    } catch (error) {
      console.error("Failed to load dropdowns", error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await fetchPaymentStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await fetchPayments({
        page,
        limit: 20,
        search,
        departmentId,
        classId,
        yearId,
        status
      });
      setPayments(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to load payments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const details = await fetchPaymentDetails(id);
      setSelectedPayment(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to load details", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
        <p className="text-gray-500">Monitor token purchases and payment activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.totalTransactions}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Successful Payments</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.successfulPayments}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Failed Payments</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.failedPayments}</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by student name, reg no, or reference..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
            >
              <option value="">All Years</option>
              {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No payments found matching your filters.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.studentName || "N/A"}</div>
                      <div className="text-xs text-gray-500">{payment.registrationNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.Department?.name || "N/A"}</div>
                      <div className="text-xs text-gray-500">{payment.Class?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                      <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {payment.paymentReference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'success' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleView(payment.id)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-200 rounded-lg p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                selectedPayment.status === 'success' ? 'bg-green-50 border border-green-200' :
                selectedPayment.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-red-50 border border-red-200'
              }`}>
                {selectedPayment.status === 'success' ? <CheckCircle className="text-green-600" /> :
                 selectedPayment.status === 'pending' ? <AlertCircle className="text-yellow-600" /> :
                 <AlertCircle className="text-red-600" />}
                <div>
                  <h4 className={`text-sm font-bold ${
                    selectedPayment.status === 'success' ? 'text-green-800' :
                    selectedPayment.status === 'pending' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    Payment {selectedPayment.status === 'success' ? 'Successful' : selectedPayment.status}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {selectedPayment.status === 'success' 
                      ? `Processed on ${new Date(selectedPayment.paidAt || selectedPayment.updatedAt).toLocaleString()}` 
                      : 'Transaction is awaiting confirmation'}
                  </p>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Student Name</p>
                  <p className="font-medium text-gray-900">{selectedPayment.studentName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Registration Number</p>
                  <p className="font-medium text-gray-900">{selectedPayment.registrationNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Amount Paid</p>
                  <p className="font-medium text-gray-900 text-lg">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</p>
                  <p className="font-medium text-gray-900 uppercase">{selectedPayment.paymentMethod}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Reference</p>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block text-gray-700">
                    {selectedPayment.paymentReference}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Paystack Reference</p>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block text-gray-700">
                    {selectedPayment.paystackReference || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
                  <p className="font-medium text-gray-900">{selectedPayment.Department?.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Year / Class</p>
                  <p className="font-medium text-gray-900">
                    {selectedPayment.Year?.name || 'N/A'} • {selectedPayment.Class?.name || 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Metadata Dump (Optional) */}
              {selectedPayment.metadata && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Raw Metadata</p>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(selectedPayment.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
