import axiosClient from './axiosClient';

export const getUsersAPI = async (page: number = 1, limit: number = 15) => {
  try {
    const response = await axiosClient.get(`/api/users`, {
      params: {
        page,
        pageSize: limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserByIdAPI = async (id: string) => {
  try {
    const response = await axiosClient.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createUserAPI = async (data: any) => {
  try {
    const response = await axiosClient.post(`/api/users`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUserAPI = async (id: string, data: any) => {
  try {
    const response = await axiosClient.put(`/api/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const toggleUserStatusAPI = async (id: string, isActive: boolean) => {
  try {
    const response = await axiosClient.patch(`/api/users/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};
