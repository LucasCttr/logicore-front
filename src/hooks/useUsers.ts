import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsersAPI, getUserByIdAPI, createUserAPI, updateUserAPI, toggleUserStatusAPI } from '../api/users';
import type { User, CreateUserDto, UpdateUserDto, PagedUserResult } from '../types/users';

interface UserListForUI {
  items: User[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  pageSize: number;
}

export const useUsers = (page: number = 1, limit: number = 15) => {
  return useQuery<UserListForUI>({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const response: PagedUserResult = await getUsersAPI(page, limit);
      const { items, total, page: currentPage, pageSize } = response;
      const totalPages = Math.ceil(total / pageSize);
      return {
        items,
        totalCount: total,
        pageNumber: currentPage,
        totalPages,
        pageSize,
      };
    },
  });
};

export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: () => getUserByIdAPI(id),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserDto) => createUserAPI(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserDto) => updateUserAPI(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleUserStatusAPI(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
