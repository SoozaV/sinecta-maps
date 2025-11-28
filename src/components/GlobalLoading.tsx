import { useGlobalStore } from "../stores/useGlobalStore";

/**
 * Componente de loading global
 * Muestra una barra de progreso en la parte superior cuando hay peticiones activas
 */
export const GlobalLoading = () => {
  const { isLoading } = useGlobalStore();

  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        backgroundColor: "#4285f4",
        zIndex: 9999,
        animation: "loading 1s ease-in-out infinite",
      }}
    />
  );
};

