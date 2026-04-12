import api from './api';

export async function fetchExploreSummaries() {
  const { data } = await api.get('/explore/summaries');
  return data || [];
}

export async function fetchExploreAuthors() {
  const { data } = await api.get('/explore/authors');
  return data || [];
}

export async function fetchExploreAudiobooks(googleId) {
  const { data } = await api.get('/explore/audiobooks', {
    params: googleId ? { googleId } : undefined,
  });
  return data || [];
}

export async function verifyExploreAudiobookCode({ googleId, code }) {
  const { data } = await api.post('/explore/audiobooks/verify', {
    googleId,
    code,
  });
  return data;
}
