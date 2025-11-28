import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { AppError, handleApiError } from '../errorHandler';

describe('errorHandler', () => {
  describe('AppError', () => {
    it('should create an error with message, code, and optional statusCode', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 404);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('AppError');
    });

    it('should create an error without statusCode', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('handleApiError', () => {
    it('should handle AxiosError with response', () => {
      const mockError = new AxiosError(
        'Bad request',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 400,
          statusText: 'Bad Request',
          data: { message: 'Bad request' },
          headers: {},
          config: {} as never,
        }
      );
      
      const error = handleApiError(mockError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Bad request');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should handle AxiosError without message in response data', () => {
      const mockError = new AxiosError(
        'Server error',
        'ERR_SERVER_ERROR',
        undefined,
        undefined,
        {
          status: 500,
          statusText: 'Internal Server Error',
          data: {},
          headers: {},
          config: {} as never,
        }
      );
      
      const error = handleApiError(mockError);
      
      expect(error.message).toBe('Error en la petición');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should handle AxiosError with request but no response (network error)', () => {
      const mockError = new AxiosError(
        'Network error',
        'ERR_NETWORK',
        undefined,
        {} as never
      );
      
      const error = handleApiError(mockError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('No se pudo conectar con el servidor');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBeUndefined();
    });

    it('should handle standard Error', () => {
      const mockError = new Error('Unknown error occurred');
      
      const error = handleApiError(mockError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Unknown error occurred');
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.statusCode).toBeUndefined();
    });

    it('should handle non-Error objects', () => {
      const mockError = { someProperty: 'value' };
      
      const error = handleApiError(mockError);
      
      expect(error.message).toBe('Error desconocido');
      expect(error.code).toBe('UNKNOWN_ERROR');
    });
  });
});

