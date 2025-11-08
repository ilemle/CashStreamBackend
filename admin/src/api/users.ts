import apiClient from './client';

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UsersResponse = {
  success: boolean;
  data: User[];
  pagination: PaginationInfo;
};

export type GetUsersParams = {
  page?: number;
  limit?: number;
};

export const usersApi = {
  getAll: async (params?: GetUsersParams): Promise<UsersResponse> => {
    const response = await apiClient.get<UsersResponse>('/admin/users', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
      },
    });
    return response.data;
  },
};

