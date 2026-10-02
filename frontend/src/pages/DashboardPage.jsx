import React, { useState, useEffect } from 'react';
import { 
  FileCheck, ShieldAlert, AlertOctagon, HelpCircle, FileText, TrendingUp, 
  Search, Award, Download, ArrowUpRight, BarChart2 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { fetchDashboardStats } from '../services/api';

const PIE_COLORS = ['#138808', '#E09F00', '#ED1C24', '#123A8C'];

export default function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(data => setStats(data))
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading सतर्क SIGHT metrics...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Content Analyzed', value: stats.content_analyzed, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Claims Verified', value: stats.claims_verified, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Unverified Claims', value: stats.unverified_claims, icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'High-Risk Content', value: stats.high_risk_content, icon: AlertOctagon, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    { label: 'Reports Submitted', value: stats.reports_submitted, icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  ];

  return (
    <div className="space-y-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Verification Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time retail investor protection telemetry and official filing corroboration metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('analyze')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Analyze New Post</span>
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Practice Mode</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`bg-white rounded-xl border ${card.border} p-4 shadow-sm flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{card.value}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">+14% this month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Chart: Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Verification Results Over Time</h3>
            <p className="text-xs text-slate-400">Daily verification volumes categorized by status</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">Trailing 7 Days</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.verification_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#138808" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#138808" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHighRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ED1C24" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ED1C24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8DEE8" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#D8DEE8' }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Area type="monotone" dataKey="verified" name="Verified Claims" stroke="#138808" fillOpacity={1} fill="url(#colorVerified)" />
              <Area type="monotone" dataKey="high_risk" name="High Risk Flagged" stroke="#ED1C24" fillOpacity={1} fill="url(#colorHighRisk)" />
              <Area type="monotone" dataKey="unverified" name="Unverified" stroke="#E09F00" fillOpacity={0.2} fill="#E09F00" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts: Red Flags & Claim Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Red Flag Categories */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Prevalent Red-Flag Categories</h3>
            <p className="text-xs text-slate-400">Frequency of deceptive markers detected across analyzed sources</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.red_flag_categories} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#D8DEE8" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#D8DEE8' }} />
                <Bar dataKey="count" name="Violations Detected" fill="#ED1C24" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claim Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Claim Status Distribution</h3>
            <p className="text-xs text-slate-400">Total verified vs unverified assertions</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.claim_status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.claim_status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
