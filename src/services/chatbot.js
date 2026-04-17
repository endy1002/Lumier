import api from './api';

export async function saveChatbotPreferences({ googleId, answers }) {
  const payload = {
    genreOption: answers?.[1] || '',
    readingTimeOption: answers?.[2] || '',
    recentBookOption: answers?.[3] || '',
  };

  const { data } = await api.post('/chatbot/preferences', payload, {
    params: { googleId },
  });

  return data;
}
