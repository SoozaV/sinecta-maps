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
});
