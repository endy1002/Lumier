import api from './api';

export async function fetchAdminExploreDashboard(googleId) {
  const { data } = await api.get('/admin/explore/dashboard', {
    params: { googleId },
  });

  return {
    products: data?.products || [],
    authors: data?.authors || [],
    audiobooks: data?.audiobooks || [],
  };
}

export async function updateAdminAudiobook({ googleId, audiobookId, payload }) {
  const { data } = await api.put(`/admin/explore/audiobooks/${audiobookId}`, payload, {
    params: { googleId },
  });

  return data;
}

export async function createAdminProduct({ googleId, payload }) {
  const { data } = await api.post('/admin/explore/products', payload, {
    params: { googleId },
  });
  return data;
}

export async function updateAdminProduct({ googleId, productId, payload }) {
  const { data } = await api.put(`/admin/explore/products/${productId}`, payload, {
    params: { googleId },
  });
  return data;
}

export async function deleteAdminProduct({ googleId, productId }) {
  await api.delete(`/admin/explore/products/${productId}`, {
    params: { googleId },
  });
}

export async function createAdminAuthor({ googleId, payload }) {
  const { data } = await api.post('/admin/explore/authors', payload, {
    params: { googleId },
  });
  return data;
}

export async function updateAdminAuthor({ googleId, authorId, payload }) {
  const { data } = await api.put(`/admin/explore/authors/${authorId}`, payload, {
    params: { googleId },
  });
  return data;
}

export async function deleteAdminAuthor({ googleId, authorId }) {
  await api.delete(`/admin/explore/authors/${authorId}`, {
    params: { googleId },
  });
}

export async function uploadAdminImage({ googleId, file, onProgress }) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/admin/media/upload-image', formData, {
    params: { googleId },
    timeout: 180000,
    onUploadProgress: (event) => {
      if (typeof onProgress !== 'function') {
        return;
      }

      const loaded = event?.loaded || 0;
      const total = event?.total || 0;
      const progress = total > 0 ? Math.round((loaded / total) * 100) : null;
      onProgress({ loaded, total, progress });
    },
  });

  return data;
}

export async function uploadAdminAudio({ googleId, file, onProgress }) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/admin/media/upload-audio', formData, {
    params: { googleId },
    timeout: 600000,
    onUploadProgress: (event) => {
      if (typeof onProgress !== 'function') {
        return;
      }

      const loaded = event?.loaded || 0;
      const total = event?.total || 0;
      const progress = total > 0 ? Math.round((loaded / total) * 100) : null;
      onProgress({ loaded, total, progress });
    },
  });

  return data;
}

export async function fetchAdminBlogs(googleId) {
  const { data } = await api.get('/admin/blogs', {
    params: { googleId },
  });

  return data || [];
}

export async function createAdminBlog({ googleId, payload }) {
  const { data } = await api.post('/admin/blogs', payload, {
    params: { googleId },
  });
  return data;
}

export async function updateAdminBlog({ googleId, blogId, payload }) {
  const { data } = await api.put(`/admin/blogs/${blogId}`, payload, {
    params: { googleId },
  });
  return data;
}

export async function deleteAdminBlog({ googleId, blogId }) {
  await api.delete(`/admin/blogs/${blogId}`, {
    params: { googleId },
  });
}

export async function fetchAdminOrders(googleId) {
  const { data } = await api.get('/admin/management/orders', { params: { googleId } });
  return data || [];
}

export async function updateAdminOrderStatus({ googleId, orderId, status }) {
  const { data } = await api.put(
    `/admin/management/orders/${orderId}/status`,
    { status },
    { params: { googleId } }
  );
  return data;
}

export async function fetchAdminUsers(googleId) {
  const { data } = await api.get('/admin/management/users', { params: { googleId } });
  return data || [];
}

export async function updateAdminUserRole({ googleId, userId, role }) {
  const { data } = await api.put(
    `/admin/management/users/${userId}/role`,
    { role },
    { params: { googleId } }
  );
  return data;
}
