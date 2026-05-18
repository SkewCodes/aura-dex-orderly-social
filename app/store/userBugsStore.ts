import { create } from 'zustand';
import { getUserBugsIssues, BugsIssue, BugsIssuesResponse } from '~/api/user_bugs_issues';

interface UserBugsStoreState {
  bugsIssues: BugsIssue[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  limit: number;
  currentPage: number; // offset 대신 currentPage 사용
  // hasMore: boolean; // API 응답에 has_more가 없으므로, totalPages와 currentPage로 계산 가능
  startDate: string; // Unix timestamp (초)
  endDate: string;   // Unix timestamp (초)
  userId: number;
  fetchBugsIssues: (userId: number, newStartDate?: string, newEndDate?: string, resetPagination?: boolean) => Promise<void>;
  setDateRange: (startDate: string, endDate: string) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToPage: (page: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  // getCurrentPage는 상태에서 직접 접근
  getTotalPages: () => number;
  getHasMore: () => boolean;
}

export const useUserBugsStore = create<UserBugsStoreState>((set, get) => ({
  bugsIssues: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  limit: 10,
  currentPage: 1,
  // hasMore는 API 응답에 따라 또는 계산하여 설정
  startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), // Default to 7 days ago
  endDate: new Date().toISOString(),
  userId: -1,

  fetchBugsIssues: async (userId: number, newStartDate?: string, newEndDate?: string, resetPagination = false) => {
    const { limit, currentPage: currentPage, startDate: currentStartDate, endDate: currentEndDate } = get();
    
    try {
      set({ isLoading: true, error: null, userId });
      
      const start = newStartDate !== undefined ? newStartDate : currentStartDate;
      const end = newEndDate !== undefined ? newEndDate : currentEndDate;
      const pageToFetch = resetPagination ? 1 : currentPage;
      
      // API는 page, limit을 받음
      const response = await getUserBugsIssues(userId, pageToFetch, limit, start, end);
      console.log('bugs issuses response', response);
      
      set({
        bugsIssues: response.data,
        totalCount: response.total,
        currentPage: response.page, // API 응답의 page 사용
        // hasMore: response.page * response.page_size < response.total, // API 응답 기반으로 hasMore 계산
        startDate: start,
        endDate: end,
        isLoading: false
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch BUGS issues' 
      });
    }
  },

  setDateRange: (startDate: string, endDate: string) => {
    set({ 
      startDate, 
      endDate, 
      currentPage: 1 // 날짜 범위 변경 시 페이지네이션 리셋
    });
    
    const { userId } = get();
    if (userId !== -1) {
      get().fetchBugsIssues(userId, startDate, endDate, true);
    }
  },

  goToNextPage: () => {
    const { currentPage, getTotalPages, userId } = get();
    const totalPages = getTotalPages();
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      set({ currentPage: nextPage });
      if (userId !== -1) {
        get().fetchBugsIssues(userId);
      }
    }
  },

  goToPrevPage: () => {
    const { currentPage, userId } = get();
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      set({ currentPage: prevPage });
      if (userId !== -1) {
        get().fetchBugsIssues(userId);
      }
    }
  },

  goToPage: (page: number) => {
    const { getTotalPages, userId } = get();
    const totalPages = getTotalPages();
    const newPage = Math.min(totalPages, Math.max(1, page));
    set({ currentPage: newPage });
    
    if (userId !== -1) {
      get().fetchBugsIssues(userId);
    }
  },

  goToFirstPage: () => {
    const { userId } = get();
    set({ currentPage: 1 });
    
    if (userId !== -1) {
      get().fetchBugsIssues(userId);
    }
  },

  goToLastPage: () => {
    const { getTotalPages, userId } = get();
    const totalPages = getTotalPages();
    set({ currentPage: totalPages > 0 ? totalPages : 1 });
    
    if (userId !== -1) {
      get().fetchBugsIssues(userId);
    }
  },

  getTotalPages: () => {
    const { totalCount, limit } = get();
    return Math.ceil(totalCount / limit);
  },

  getHasMore: () => {
    const { currentPage, getTotalPages } = get();
    return currentPage < getTotalPages();
  }
})); 