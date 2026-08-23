import api from './axios';

export const getTickets = async () => {
  return await api.get('/api/v1/tickets');
};

export const getTicket = async (id: string) => {
  return await api.get(`/api/v1/tickets/${id}`);
};

export const createTicket = async (data: { subject: string; description: string; priority?: string; category?: string }) => {
  return await api.post('/api/v1/tickets', data);
};

export const sendTicketMessage = async (ticketId: string, data: { message: string; attachment_url?: string | null }) => {
  return await api.post(`/api/v1/tickets/${ticketId}/messages`, data);
};

export const getTechnicianTickets = async () => {
  return await api.get('/api/v1/technician/tickets');
};

export const updateTicketStatus = async (id: string, status: string) => {
  return await api.put(`/api/v1/technician/tickets/${id}/status`, { status });
};
