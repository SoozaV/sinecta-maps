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

export const handleApiError = (error: any): AppError => {
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
  
  return new AppError(
    error.message || 'Error desconocido',
    'UNKNOWN_ERROR'
  );
};
