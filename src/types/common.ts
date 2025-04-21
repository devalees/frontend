export interface LocalPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, unknown>;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
} 