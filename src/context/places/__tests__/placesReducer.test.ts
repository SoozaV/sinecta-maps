import { describe, it, expect } from 'vitest';
import { placesReducer } from '../placesReducer';
import type { PlacesState } from '../PlacesProvider';

describe('placesReducer', () => {
  const initialState: PlacesState = {
    isLoading: true,
    userLocation: undefined,
  };

  it('should set user location and stop loading', () => {
    const location: [number, number] = [-99.1332, 19.4326];
    
    const newState = placesReducer(initialState, {
      type: 'setUserLocation',
      payload: location,
    });

    expect(newState.userLocation).toEqual(location);
    expect(newState.isLoading).toBe(false);
  });

  it('should update loading state', () => {
    const newState = placesReducer(initialState, {
      type: 'setLoading',
      payload: false,
    });

    expect(newState.isLoading).toBe(false);
  });

  it('should preserve user location when updating loading state', () => {
    const location: [number, number] = [-99.1332, 19.4326];
    const stateWithLocation: PlacesState = {
      isLoading: false,
      userLocation: location,
    };
    
    const newState = placesReducer(stateWithLocation, {
      type: 'setLoading',
      payload: true,
    });

    expect(newState.userLocation).toEqual(location);
    expect(newState.isLoading).toBe(true);
  });

  it('should return current state on unknown action', () => {
    const stateWithLocation: PlacesState = {
      isLoading: false,
      userLocation: [-99.1332, 19.4326],
    };
    
    // Probamos acción no válida para validar el default case
    // Usamos 'as any' para bypassear el tipo estricto en el test
    const newState = placesReducer(stateWithLocation, {
      type: 'UNKNOWN_ACTION',
      payload: 'test',
    } as any);

    // El reducer debe retornar el mismo estado sin modificar
    expect(newState).toBe(stateWithLocation); // Misma referencia (no muta ni crea nuevo objeto)
    expect(newState.isLoading).toBe(false);
    expect(newState.userLocation).toEqual([-99.1332, 19.4326]);
  });
});
