import { useQuery } from '@tanstack/react-query';
import { getDriversWithDetails } from '../api/drivers';
import { DriverDetailsWithUser } from '../types/driverDetails';

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
      const response = await getDriversWithDetails(page, limit, search, isActive);
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
}
