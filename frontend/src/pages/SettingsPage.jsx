import React, { useState, useEffect } from 'react';
import { Settings, Database, Upload, Shield, CheckCircle2, AlertCircle, FileText, Server } from 'lucide-react';
import { uploadOfficialDocument } from '../services/api';

export default function SettingsPage() {
  const [sources, setSources] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [authority, setAuthority] = useState('Stock Exchange Disclosure (NSE/BSE)');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetch('/api/evidence/sources')
      .then(res => res.json())
      .then(data => {
        setSources(data);
        setBackendStatus('online');
      })
      .catch(() => {
        setBackendStatus('offline');
      });
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !issuer || !file) {
      setUploadError('Please specify title, issuer, and attach a file (.txt, .md).');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('issuer', issuer);
      formData.append('authority', authority);
      formData.append('file', file);

      const res = await uploadOfficialDocument(formData);
      setUploadSuccess(res.message);
      setTitle('');
      setIssuer('');
      setFile(null);
      // Reload sources
      const updated = await fetch('/api/evidence/sources').then(r => r.json());
      setSources(updated);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & RAG Knowledge Base</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Inspect local vector database configuration, indexed official filings, and external LLM provider status.
        </p>
      </div>

      {/* Backend & Environment Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">FastAPI Backend</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span className="text-sm font-bold text-slate-900 capitalize">{backendStatus}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">http://127.0.0.1:8000</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">NLP & RAG Engine</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-bold text-slate-900">Semantic Vector Store</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{sources.length} Documents Indexed</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Security Architecture</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-bold text-slate-900">Zero Keys in Frontend</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Backend-Only Environment Isolation</span>
        </div>
      </div>

      {/* Upload New Official Source Document to RAG */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Upload Official Source Document to RAG Knowledge Base</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Upload official corporate earnings releases, quarterly filings, or regulatory circulars to expand the RAG evidence pool.
        </p>

        {uploadSuccess && (
          <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Infy Q4 Financial Results"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issuer / Corporate Entity *</label>
              <input
                type="text"
                required
                placeholder="e.g. Infosys Limited"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Regulatory Authority / Classification</label>
              <select
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Stock Exchange Disclosure (NSE/BSE)">Stock Exchange Disclosure (NSE/BSE)</option>
                <option value="SEBI Regulatory Directive">SEBI Regulatory Directive</option>
                <option value="Central Bank (RBI) Statement">Central Bank (RBI) Statement</option>
                <option value="Audited Annual Report">Audited Annual Report</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Source File (.txt, .md, .json) *</label>
              <input
                type="file"
                required
                accept=".txt,.md,.json"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg text-xs shadow-sm transition-all"
          >
            {uploading ? 'Indexing Document...' : 'Upload & Index into Vector Store'}
          </button>
        </form>
      </div>

      {/* Currently Indexed Sources */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Active Official Documents in RAG Vector Store</h3>
        <div className="divide-y divide-slate-100">
          {sources.map((s, idx) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-bold text-slate-800">{s.title}</span>
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">{s.issuer}</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{s.authority} • Filing: {s.date}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded self-start sm:self-auto">
                Indexed in RAM
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
