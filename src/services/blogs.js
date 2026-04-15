import api from './api';

export async function fetchBlogCards() {
  const { data } = await api.get('/blogs');
  return data || [];
}

export async function fetchBlogDetail(slug) {
  const { data } = await api.get(`/blogs/${slug}`);
  return data;
}
