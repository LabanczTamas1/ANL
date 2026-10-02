// mockData.ts
//
// Shape mirrors the backend `/api/terminatedStatistics` response so the
// mock/real toggle can swap sources without changing the UI.

export interface StatusStatistics {
  total: number;
  active: number;
  inactive: number;
  terminated: number;
  byStatus: Record<string, number>;
}

export const mockTerminatedStatistics: StatusStatistics = {
  total: 142,
  active: 98,
  inactive: 21,
  terminated: 23,
  byStatus: {
    active: 98,
    inactive: 21,
    terminated: 23,
  },
};
