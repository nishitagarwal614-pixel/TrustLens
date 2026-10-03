import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Eye,
  Filter,
  AlertOctagon,
  CheckCircle2,
  AlertCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

import {
  fetchHistory,
  deleteAnalysisRecord,
  clearAllHistory
} from '../services/api';

import { useLanguage } from '../context/LanguageContext';

export default function HistoryPage({
  onSelectAnalysis,
  onNavigate
}) {
  const { t } = useLanguage();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const loadHistory = async (statusFilter = 'All') => {
    setLoading(true);

    try {
      /*
       * Backend returns:
       *
       * {
       *   count: number,
       *   limit: number,
       *   offset: number,
       *   results: [...]
       * }
       *
       * So we must read data.results instead of
       * treating the complete response as an array.
       */

      const backendFilter =
        statusFilter === 'All'
          ? ''
          : statusFilter === 'High Risk'
            ? 'High'
            : statusFilter;

      const data = await fetchHistory(backendFilter);

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setHistory(records);

    } catch (err) {
      console.error(
        'Failed to load verification history:',
        err
      );

      setHistory([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(filter);
  }, [filter]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (
      !window.confirm(
        'Delete this verification record from history?'
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteAnalysisRecord(id);

      setHistory((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

    } catch (err) {
      alert(
        'Failed to delete analysis: ' +
          err.message
      );

    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear all verification history records?'
      )
    ) {
      return;
    }

    setClearing(true);

    try {
      await clearAllHistory();

      setHistory([]);

    } catch (err) {
      alert(
        'Failed to clear history: ' +
          err.message
      );

    } finally {
      setClearing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#138808]" />
            Verified
          </span>
        );

      case 'Contradicted':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-[#ED1C24]" />
            Contradicted
          </span>
        );

      case 'Partially Verified':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#E09F00]" />
            Partially Verified
          </span>
        );

      case 'Potential Risk':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-[#C62828] flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-[#C62828]" />
            Potential Risk
          </span>
        );

      case 'Unverified':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-[#123A8C]" />
            Unverified
          </span>
        );

      case 'Needs more evidence':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Needs More Evidence
          </span>
        );

      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700">
            HIGH
          </span>
        );

      case 'medium':
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-700">
            MEDIUM
          </span>
        );

      default:
        return (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
            SAFE
          </span>
        );
    }
  };

  const filters = [
    'All',
    'High Risk',
    'Unverified',
    'Verified',
    'Contradicted'
  ];

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">

        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t?.history?.title ||
                'Verification History'}
            </h1>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            {t?.history?.subtitle ||
              'Audit trail of analyzed financial posts, extracted claims, and detected red-flag violations.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">

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

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-medium transition-all flex items-center gap-1.5 ml-auto sm:ml-2 cursor-pointer"
              title="Clear all verification history"
            >
              <Trash2 className="w-3.5 h-3.5" />

              <span>
                {clearing
                  ? 'Clearing...'
                  : (
                      t?.history?.btnClearAll ||
                      'Clear All'
                    )}
              </span>
            </button>
          )}

        </div>
      </div>

      {/* Loading */}
      {loading ? (

        <div className="py-16 text-center text-slate-400">

          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />

          <p className="text-xs">
            {t?.landing?.scanning ||
              'Loading verification records...'}
          </p>

        </div>

      ) : history.length === 0 ? (

        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-14 text-center shadow-sm max-w-lg mx-auto my-6">

          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 border border-slate-200">
            <History className="w-7 h-7 text-slate-400" />
          </div>

          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            {t?.history?.empty ||
              'No history available'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">

            {filter !== 'All'
              ? 'There is no verification history matching the selected filter.'
              : 'No past content verifications have been recorded yet. Analyze a financial post or link to populate your verification audit history.'}

          </p>

          <div className="mt-6 flex items-center justify-center gap-2.5">

            {filter !== 'All' && (
              <button
                onClick={() =>
                  setFilter('All')
                }
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Reset Filter
              </button>
            )}

            {onNavigate && (
              <button
                onClick={() =>
                  onNavigate('analyze')
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Analyze Content
              </button>
            )}

          </div>
        </div>

      ) : (

        /* History Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs text-slate-700">

              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">

                <tr>
                  <th className="py-3 px-4">
                    Date
                  </th>

                  <th className="py-3 px-4">
                    Content Preview
                  </th>

                  <th className="py-3 px-4">
                    Risk Level
                  </th>

                  <th className="py-3 px-4">
                    Claims
                  </th>

                  <th className="py-3 px-4">
                    Evidence
                  </th>

                  <th className="py-3 px-4">
                    Status
                  </th>

                  <th className="py-3 px-4 text-right">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {history.map((item) => (

                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() =>
                      onSelectAnalysis(item.id)
                    }
                  >

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">

                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )
                        : 'Recent'}

                    </td>

                    {/* Content */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">

                      <p className="font-medium text-slate-800 line-clamp-2 italic">
                        "{item.content}"
                      </p>

                      <span className="text-[10px] text-slate-400 mt-0.5 block">

                        Source:{' '}
                        {item.creator_handle ||
                          'Anonymous / Unknown'}

                      </span>

                    </td>

                    {/* Risk */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRiskBadge(
                        item.risk_level
                      )}
                    </td>

                    {/* Claims */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-medium">

                      {item.claims_count || 0}{' '}
                      claim
                      {item.claims_count !== 1
                        ? 's'
                        : ''}

                    </td>

                    {/* Evidence */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-medium text-blue-700">

                      {item.evidence_count || 0}{' '}
                      source
                      {item.evidence_count !== 1
                        ? 's'
                        : ''}

                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">

                      {getStatusBadge(
                        item.overall_status
                      )}

                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap space-x-1"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >

                      <button
                        onClick={() =>
                          onSelectAnalysis(
                            item.id
                          )
                        }
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                        title="View Detailed Analysis"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) =>
                          handleDelete(
                            item.id,
                            e
                          )
                        }
                        disabled={
                          deletingId === item.id
                        }
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