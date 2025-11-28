import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from "axios";
import { useGlobalStore } from "../stores/useGlobalStore";

/**
 * Interceptor de loading global
 * Muestra/oculta un spinner global basado en el contador de peticiones activas
 */
export function setupLoadingInterceptor(axiosInstance: AxiosInstance) {
  // REQUEST INTERCEPTOR
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Permitir desactivar loading por petición con flag ignoreLoading
      if (!config.ignoreLoading) {
        useGlobalStore.getState().startLoading();
      }
      return config;
    },
    (error: unknown) => {
      useGlobalStore.getState().stopLoading();
      return Promise.reject(error);
    }
  );

  // RESPONSE INTERCEPTOR
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (!response.config.ignoreLoading) {
        useGlobalStore.getState().stopLoading();
      }
      return response;
    },
    (error: unknown) => {
      // Type narrowing: Axios interceptors always receive AxiosError in response error handler
      const axiosError = error as AxiosError;
      if (!axiosError.config?.ignoreLoading) {
        useGlobalStore.getState().stopLoading();
      }
      return Promise.reject(error);
    }
  );
}

// Extend Axios types para soportar ignoreLoading
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    ignoreLoading?: boolean;
    showOfflineBanner?: boolean;
    ignoreErrorMessage?: boolean;
  }

  export interface AxiosRequestConfig {
    ignoreLoading?: boolean;
    showOfflineBanner?: boolean;
    ignoreErrorMessage?: boolean;
  }
}

