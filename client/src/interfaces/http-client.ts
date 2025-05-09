// Interface for HTTP parameter options
export interface IParams {
  [key: string]: any;
  signal?: AbortSignal;
} 