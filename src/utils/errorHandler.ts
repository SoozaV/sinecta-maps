import { AxiosError } from 'axios';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  // Type guard for AxiosError
  if (error instanceof AxiosError) {
    if (error.response) {
      return new AppError(
        error.response.data?.message || 'Error en la petición',
        'API_ERROR',
        error.response.status
      );
    }
    
    if (error.request) {
      return new AppError(
        'No se pudo conectar con el servidor',
        'NETWORK_ERROR'
      );
    }
  }
  
  // Type guard for standard Error
  if (error instanceof Error) {
    return new AppError(
      error.message,
      'UNKNOWN_ERROR'
    );
  }
  
  // Fallback for non-Error objects
  return new AppError(
    'Error desconocido',
    'UNKNOWN_ERROR'
  );
};
