import api from './axios';

export const loginUser = (email: string, password: string) => {
  return api.post('/api/v1/auth/login', { email, password });
};

export const registerUser = (data: { full_name?: string; first_name?: string; last_name?: string; email: string; password: string }) => {
  return api.post('/api/v1/auth/register', data);
};

export const getMe = () => {
  return api.get('/api/v1/auth/me');
};
