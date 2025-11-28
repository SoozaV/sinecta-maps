import { describe, it, expect } from 'vitest';
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
    it('should handle API response errors', () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Bad request',
          },
        },
      };
      
      const error = handleApiError(mockError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Bad request');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should handle API errors without message in response data', () => {
      const mockError = {
        response: {
          status: 500,
          data: {},
        },
      };
      
      const error = handleApiError(mockError);
      
      expect(error.message).toBe('Error en la petición');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should handle network errors', () => {
      const mockError = {
        request: {},
      };
      
      const error = handleApiError(mockError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('No se pudo conectar con el servidor');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBeUndefined();
    });

    it('should handle unknown errors', () => {
      const mockError = {
        message: 'Unknown error occurred',
      };
      
      const error = handleApiError(mockError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Unknown error occurred');
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.statusCode).toBeUndefined();
    });

    it('should handle errors without message', () => {
      const mockError = {};
      
      const error = handleApiError(mockError);
      
      expect(error.message).toBe('Error desconocido');
      expect(error.code).toBe('UNKNOWN_ERROR');
    });
  });
});

