import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const subscribeToNewsletter = async (email, preferences) => {
    return await api.post('/subscribe', { email, preferences });
};

export const sendNewsletter = async (subject, content) => {
    return await api.post('/send-newsletter', { subject, content });
};

export const getSubscribers = async () => {
    return await api.get('/subscribers');
};

export const getEmailStats = async () => {
    return await api.get('/email-stats');
};

export const getEmailHistory = async () => {
    return await api.get('/email-history');
};

export const generateContent = async (prompt) => {
    return await api.post('/generate-content', { prompt });
};

export const generateGeminiContent = async (topic, tone, language) => {
    // The base URL is /api, and the gemini endpoint is /api/gemini/...
    // So we need to call '/gemini/generate-newsletter'
    return await api.post('/gemini/generate-newsletter', { topic, tone, language });
};

export const getEmailStatsOverTime = async () => {
    return await api.get('/stats/emails-over-time');
};

export default api;