export const getUserLocation = async (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve([coords.longitude, coords.latitude]);
      },
      (err: GeolocationPositionError) => {
        let errorMessage = "No se pudo obtener la geolocalización";
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Permiso de geolocalización denegado. Por favor, habilita la ubicación en la configuración del navegador.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "La información de ubicación no está disponible. Verifica tu conexión o configuración de ubicación.";
            break;
          case err.TIMEOUT:
            errorMessage = "Tiempo de espera agotado al obtener la ubicación.";
            break;
          default:
            errorMessage = err.message || "Error desconocido al obtener la ubicación.";
            break;
        }
        
        console.error("Geolocation error:", {
          code: err.code,
          message: err.message || errorMessage,
        });
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutos
      }
    );
  });
};
