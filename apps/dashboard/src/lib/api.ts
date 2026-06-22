import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSessions = async (page = 1, limit = 20) => {
  const { data } = await api.get('/sessions', { params: { page, limit } });
  return data;
};

export const getSessionTimeline = async (sessionId: string) => {
  const { data } = await api.get(`/sessions/${sessionId}`);
  return data;
};

export const getHeatmapData = async (pageUrl: string) => {
  const { data } = await api.get('/heatmap', { params: { pageUrl } });
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/stats');
  return data;
};

export default api;
