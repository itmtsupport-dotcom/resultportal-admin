import { useEffect, useState, useMemo } from "react";
import { fetchDashboardSummary } from "../services/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Activity,
  Calendar,
  Filter
} from "lucide-react";

const COLORS = ["#2563EB", "#C2185B", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30d");

  const formatter = useMemo(() => new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }), []);

  useEffect(() => {
    let active = true;
    const loadSummary = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardSummary();
        if (active) setSummary(data);
      } catch (err) {
        if (active) setError("Unable to load analytics data.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadSummary();
    return () => { active = false; };
  }, []);

  // Mock Data Generators (replace with real API data later)
  const revenueData = [
    { name: "Jan", revenue: 450000, projected: 480000 },
    { name: "Feb", revenue: 520000, projected: 500000 },
    { name: "Mar", revenue: 480000, projected: 510000 },
    { name: "Apr", revenue: 610000, projected: 550000 },
    { name: "May", revenue: 580000, projected: 600000 },
    { name: "Jun", revenue: 750000, projected: 650000 },
  ];

  const tokenUsageData = [
    { date: "01/03", used: 45, generated: 60 },
    { date: "02/03", used: 52, generated: 55 },
    { date: "03/03", used: 38, generated: 40 },
    { date: "04/03", used: 65, generated: 80 },
    { date: "05/03", used: 78, generated: 90 },
    { date: "06/03", used: 92, generated: 100 },
    { date: "07/03", used: 85, generated: 85 },
  ];

  const departmentData = [
    { name: "Computer Sci", checks: 450 },
    { name: "Electrical Eng", checks: 320 },
    { name: "Accounting", checks: 280 },
    { name: "Mass Comm", checks: 210 },
    { name: "Law", checks: 190 },
  ];

  const paymentData = [
    { name: "Successful", value: 850 },
    { name: "Failed", value: 120 },
    { name: "Pending", value: 45 },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse h-40"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          <p className="text-gray-500">Track performance metrics and key indicators.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button 
            onClick={() => setTimeRange("7d")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeRange === "7d" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimeRange("30d")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeRange === "30d" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setTimeRange("90d")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeRange === "90d" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            3 Months
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-l-4 border-l-blue-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {formatter.format(summary?.totalRevenue || 0)}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-3 font-medium flex items-center gap-1">
            <TrendingUp size={12} /> +12.5% from last month
          </p>
        </div>

        <div className="card border-l-4 border-l-pink-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tokens</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {summary?.totalTokens?.toLocaleString() || 0}
              </h3>
            </div>
            <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-3 font-medium flex items-center gap-1">
            <TrendingUp size={12} /> +5.2% new generation
          </p>
        </div>

        <div className="card border-l-4 border-l-green-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Students</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {summary?.totalStudents?.toLocaleString() || 0}
              </h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Across 5 departments
          </p>
        </div>

        <div className="card border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">68.5%</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-xs text-red-500 mt-3 font-medium flex items-center gap-1">
            <TrendingUp size={12} className="rotate-180" /> -2.1% drop
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              Monthly Revenue
            </h3>
            <button className="text-xs text-gray-500 hover:text-blue-600">Download Report</button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 12}} 
                  tickFormatter={(value) => `₦${value/1000}k`}
                />
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => formatter.format(value)}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Token Usage Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-pink-600" />
              Token Usage Trend
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tokenUsageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 12}} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="generated" 
                  stroke="#C2185B" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{r: 6}}
                  name="Generated"
                />
                <Line 
                  type="monotone" 
                  dataKey="used" 
                  stroke="#2563EB" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{r: 6}}
                  name="Used"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-purple-600" />
              Result Checks by Department
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  width={100}
                  tick={{fill: '#4B5563', fontSize: 12, fontWeight: 500}} 
                />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="checks" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} name="Result Checks">
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Success/Fail */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CreditCard size={18} className="text-green-600" />
              Payment Status
            </h3>
          </div>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10B981" /> {/* Success */}
                  <Cell fill="#EF4444" /> {/* Failed */}
                  <Cell fill="#F59E0B" /> {/* Pending */}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  <tspan x="50%" dy="-10" fontSize="24" fontWeight="bold" fill="#111827">
                    {paymentData.reduce((a, b) => a + b.value, 0)}
                  </tspan>
                  <tspan x="50%" dy="20" fontSize="12" fill="#6B7280">
                    Total Txns
                  </tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
