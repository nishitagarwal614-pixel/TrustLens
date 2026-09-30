import React, { useState, useEffect } from 'react';
import { History, Trash2, Eye, Filter, Calendar, ExternalLink, AlertOctagon, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { fetchHistory, deleteAnalysisRecord } from '../services/api';

export default function HistoryPage({ onSelectAnalysis }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = async (statusFilter = '') => {
    setLoading(true);
    try {
      const data = await fetchHistory(statusFilter === 'All' ? '' : statusFilter);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(filter);
  }, [filter]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this verification record from history?')) return;
    setDeletingId(id);
    try {
      await deleteAnalysisRecord(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete analysis: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
      case 'Contradicted':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> Contradicted</span>;
      case 'Potential Risk':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Potential Risk</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {status}</span>;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700">HIGH</span>;
      case 'medium':
        return <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-700">MEDIUM</span>;
      default:
        return <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">SAFE</span>;
    }
  };

  const filters = ['All', 'High Risk', 'Unverified', 'Verified', 'Contradicted'];

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verification History</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit trail of analyzed financial posts, extracted claims, and detected red-flag violations.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                filter === f
                  ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Loading verification records...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No verification records found.</p>
          <p className="text-xs text-slate-400 mt-1">
            Analyze a financial post to populate your verification audit history.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Content Preview</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Claims</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => onSelectAnalysis(item.id)}
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <p className="font-medium text-slate-800 line-clamp-2 italic">
                        "{item.content}"
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Source: {item.creator_handle || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRiskBadge(item.risk_level)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-medium">
                      {item.claims_count} claim{item.claims_count !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.overall_status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectAnalysis(item.id)}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                        title="View Detailed Analysis"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
