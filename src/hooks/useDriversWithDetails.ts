import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDriversWithDetails } from '../api/drivers';
import { DriverDetailsWithUser, DriverDetailsListResponse } from '../types/driverDetails';

export interface DriverDetailsListForUI {
  items: DriverDetailsWithUser[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  pageSize: number;
}

export function useDriversWithDetails(
  page: number = 1,
  limit: number = 15,
  search?: string,
  isActive?: boolean
) {
  return useQuery<DriverDetailsListForUI>({
    queryKey: ['driversWithDetails', page, limit, search, isActive],
    queryFn: async () => {
      const response: DriverDetailsListResponse = await getDriversWithDetails(page, limit, search, isActive);
      
      if (!response.isSuccess || !response.value) {
        throw new Error('Failed to fetch driver details');
      }

      const { items, total, page: currentPage, pageSize } = response.value;
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
}
