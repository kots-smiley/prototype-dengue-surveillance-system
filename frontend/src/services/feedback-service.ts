import { apiClient, buildQuery } from '../utils/api-client';
import { FeedbackThread, PaginationMeta } from '../types';

export interface FeedbackListParams {
  barangayId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateFeedbackPayload {
  subject: string;
  body: string;
  barangayId?: string;
}

export const feedbackService = {
  list(params: FeedbackListParams = {}) {
    return apiClient<{ items: FeedbackThread[]; pagination: PaginationMeta }>(
      `/feedback/threads${buildQuery(params)}`
    );
  },

  getById(id: string) {
    return apiClient<{ thread: FeedbackThread }>(`/feedback/threads/${id}`);
  },

  create(payload: CreateFeedbackPayload) {
    return apiClient<{ thread: FeedbackThread }>('/feedback/threads', {
      method: 'POST',
      body: payload,
    });
  },

  reply(id: string, body: string) {
    return apiClient<{ thread: FeedbackThread }>(`/feedback/threads/${id}/reply`, {
      method: 'POST',
      body: { body },
    });
  },

  close(id: string) {
    return apiClient<{ thread: FeedbackThread }>(`/feedback/threads/${id}/close`, {
      method: 'PUT',
    });
  },

  reopen(id: string) {
    return apiClient<{ thread: FeedbackThread }>(`/feedback/threads/${id}/reopen`, {
      method: 'PUT',
    });
  },

  unreadCount() {
    return apiClient<{ count: number }>('/feedback/unread-count');
  },
};
