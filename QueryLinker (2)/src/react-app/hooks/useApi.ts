import { useState, useEffect } from 'react';
import type { Integration, KnowledgeBase, SLAConfig, SearchRequest } from '@/shared/types';

const API_BASE = '/api';

// Generic API hook
export function useApi<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// Integration hooks
export function useIntegrations() {
  return useApi<Integration[]>('/integrations');
}

export async function createIntegration(integration: { name: string; type: string; config: any }) {
  const response = await fetch(`${API_BASE}/integrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(integration)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create integration');
  }
  
  return response.json();
}

export async function updateIntegration(id: number, integration: { name: string; type: string; config: any }) {
  const response = await fetch(`${API_BASE}/integrations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(integration)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update integration');
  }
  
  return response.json();
}

export async function deleteIntegration(id: number) {
  const response = await fetch(`${API_BASE}/integrations/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete integration');
  }
  
  return response.json();
}

export async function syncIntegration(id: number) {
  const response = await fetch(`${API_BASE}/integrations/${id}/sync`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error('Failed to sync integration');
  }
  
  return response.json();
}

// Knowledge Base hooks
export function useKnowledgeBase(category?: string, search?: string, sortBy?: string) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  
  const endpoint = `/knowledge-base${params.toString() ? `?${params.toString()}` : ''}`;
  return useApi<KnowledgeBase[]>(endpoint, [category, search, sortBy]);
}

export async function createKnowledgeBaseArticle(article: { title: string; content: string; category?: string; tags?: string[] }) {
  const response = await fetch(`${API_BASE}/knowledge-base`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create article');
  }
  
  return response.json();
}

export async function updateKnowledgeBaseArticle(id: number, article: { title: string; content: string; category?: string; tags?: string[] }) {
  const response = await fetch(`${API_BASE}/knowledge-base/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update article');
  }
  
  return response.json();
}

export async function deleteKnowledgeBaseArticle(id: number) {
  const response = await fetch(`${API_BASE}/knowledge-base/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete article');
  }
  
  return response.json();
}

export async function incrementArticleViews(id: number) {
  const response = await fetch(`${API_BASE}/knowledge-base/${id}/view`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error('Failed to update view count');
  }
  
  return response.json();
}

// SLA Configuration hooks
export function useSLAConfigs() {
  return useApi<SLAConfig[]>('/sla-configs');
}

export async function createSLAConfig(sla: { name: string; priority: string; response_time: number; resolution_time: number; escalation_rules?: any }) {
  const response = await fetch(`${API_BASE}/sla-configs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sla)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create SLA configuration');
  }
  
  return response.json();
}

export async function updateSLAConfig(id: number, sla: { name: string; priority: string; response_time: number; resolution_time: number; escalation_rules?: any }) {
  const response = await fetch(`${API_BASE}/sla-configs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sla)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update SLA configuration');
  }
  
  return response.json();
}

export async function deleteSLAConfig(id: number) {
  const response = await fetch(`${API_BASE}/sla-configs/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete SLA configuration');
  }
  
  return response.json();
}

export async function toggleSLAConfig(id: number) {
  const response = await fetch(`${API_BASE}/sla-configs/${id}/toggle`, {
    method: 'PUT'
  });
  
  if (!response.ok) {
    throw new Error('Failed to toggle SLA configuration');
  }
  
  return response.json();
}

// Search hooks
export async function performSearch(query: SearchRequest) {
  const response = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });
  
  if (!response.ok) {
    throw new Error('Search failed');
  }
  
  return response.json();
}

export function useRecentSearches() {
  return useApi<string[]>('/search/recent');
}

// Analytics hooks
export function useAnalyticsOverview(timeRange: string = '7d') {
  return useApi<any>(`/analytics/overview?timeRange=${timeRange}`, [timeRange]);
}

export async function exportAnalytics(format: 'json' | 'csv' = 'json', timeRange: string = '7d') {
  const response = await fetch(`${API_BASE}/analytics/export?format=${format}&timeRange=${timeRange}`);
  
  if (!response.ok) {
    throw new Error('Failed to export analytics');
  }
  
  if (format === 'csv') {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    return { message: 'CSV download started' };
  }
  
  return response.json();
}

// Dashboard hooks
export async function refreshDashboard() {
  const response = await fetch(`${API_BASE}/dashboard/refresh`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh dashboard');
  }
  
  return response.json();
}

// Utility hook for mutations
export function useMutation<T, P>(mutationFn: (params: P) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(params);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
