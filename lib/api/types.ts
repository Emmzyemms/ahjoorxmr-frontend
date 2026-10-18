/**
 * Shared API response wrapper and common types used across the API client layer.
 */

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export type ApiAdapter = "mock" | "http";
