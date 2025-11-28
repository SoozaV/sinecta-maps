import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useGlobalStore } from "../stores/useGlobalStore";

/**
 * Interfaz del error de API
 */
interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Mensajes de error por código HTTP
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: "Bad Request: The request is invalid.",
  401: "Unauthorized: Authentication required.",
  403: "Forbidden: You don't have permission to access this resource.",
  404: "Not Found: The requested resource doesn't exist.",
  409: "Conflict: The resource already exists.",
  422: "Unprocessable Entity: Validation failed.",
  429: "Too Many Requests: Please try again later.",
  500: "Internal Server Error: Please try again later.",
  502: "Bad Gateway: Server is temporarily unavailable.",
  503: "Service Unavailable: Please try again later.",
  504: "Gateway Timeout: The request took too long.",
};

/**
 * Interceptor de manejo de errores
 * Muestra mensajes de error automáticamente y logea en desarrollo
 */
export function setupErrorInterceptor(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      useGlobalStore.getState().setOnline();
      return response;
    },
    (error: AxiosError<ApiError>) => {
      const config = error.config as (InternalAxiosRequestConfig & {
        showOfflineBanner?: boolean;
        ignoreErrorMessage?: boolean; // ⚡ Flag para suprimir mensajes automáticos en operaciones optimistas
      }) | undefined;

      // ⚠️ Si ignoreErrorMessage está activado, solo loguear y rechazar (no mostrar mensaje)
      const ignoreErrorMessage = Boolean(config?.ignoreErrorMessage);

      // Error de red (sin respuesta del servidor)
      if (!error.response) {
        if (error.code === "ERR_CANCELED") {
          return Promise.reject(error);
        }

        const showOfflineBanner = Boolean(config?.showOfflineBanner);

        if (showOfflineBanner) {
          const offlineMessage =
            error.code === "ECONNABORTED"
              ? "Conexión inestable. Reintentando…"
              : undefined;
          useGlobalStore.getState().setOffline(offlineMessage);
        } else {
          useGlobalStore.getState().setOnline();
          // Solo mostrar mensaje si NO está marcado para ignorar
          if (!ignoreErrorMessage) {
            console.error("Network Error: Please check your internet connection.");
            // En el futuro, aquí se puede integrar un sistema de notificaciones
          }
        }

        if (import.meta.env.DEV) {
          console.error("Network Error:", error);
        }
        return Promise.reject(error);
      }

      const { status, data } = error.response;
      useGlobalStore.getState().setOnline();

      // Solo mostrar mensaje si NO está marcado para ignorar
      if (!ignoreErrorMessage) {
        const errorMessage =
          data?.message || data?.error || ERROR_MESSAGES[status] || "An unexpected error occurred";
        console.error(errorMessage);
        // En el futuro, aquí se puede integrar un sistema de notificaciones
      }

      return Promise.reject(error);
    }
  );
}

