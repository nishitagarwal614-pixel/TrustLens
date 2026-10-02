const API_BASE = '/api';

export async function analyzeContent(content, sourceUrl = '', creatorName = '', imageFile = null) {
  try {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (sourceUrl) formData.append('source_url', sourceUrl);
    if (creatorName) formData.append('creator_name', creatorName);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
      throw new Error(err.detail || `Server error: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to load dashboard statistics');
  return await res.json();
}

export async function fetchHistory(statusFilter = '') {
  const url = statusFilter ? `${API_BASE}/history?status_filter=${encodeURIComponent(statusFilter)}` : `${API_BASE}/history`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load history');
  return await res.json();
}

export async function fetchAnalysisDetail(postId) {
  const res = await fetch(`${API_BASE}/analysis/${postId}`);
  if (!res.ok) throw new Error('Failed to load analysis detail');
  return await res.json();
}

export async function deleteAnalysisRecord(postId) {
  const res = await fetch(`${API_BASE}/analysis/${postId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete analysis');
  return await res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
  return await res.json();
}

export async function fetchCreators() {
  const res = await fetch(`${API_BASE}/creators`);
  if (!res.ok) throw new Error('Failed to load creators');
  return await res.json();
}

export async function fetchCreatorProfile(creatorId) {
  const res = await fetch(`${API_BASE}/creator/${creatorId}`);
  if (!res.ok) throw new Error('Failed to load creator profile');
  return await res.json();
}

export async function submitReport(reportData) {
  const res = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData)
  });
  if (!res.ok) throw new Error('Failed to submit report');
  return await res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to load reports');
  return await res.json();
}

export async function fetchSimulatorQuestions() {
  const res = await fetch(`${API_BASE}/simulator/questions`);
  if (!res.ok) throw new Error('Failed to load simulator questions');
  return await res.json();
}

export async function submitSimulatorAnswer(questionId, answer) {
  const res = await fetch(`${API_BASE}/simulator/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: questionId, answer })
  });
  if (!res.ok) throw new Error('Failed to submit simulator answer');
  return await res.json();
}

export async function fetchSimulatorProfile() {
  const res = await fetch(`${API_BASE}/simulator/profile`);
  if (!res.ok) throw new Error('Failed to load simulator profile');
  return await res.json();
}

export async function fetchDemoCases() {
  const res = await fetch(`${API_BASE}/demo/cases`);
  if (!res.ok) throw new Error('Failed to load demo cases');
  return await res.json();
}

export async function uploadOfficialDocument(formData) {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return await res.json();
}
