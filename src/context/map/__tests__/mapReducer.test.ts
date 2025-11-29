import { describe, it, expect } from 'vitest';
import { mapReducer } from '../mapReducer';
import type { MapState } from '../MapProvider';

describe('mapReducer', () => {
  const initialState: MapState = {
    isMapReady: false,
    map: undefined,
    draw: undefined,
  };

  it('should set map and mark as ready when setMap action is dispatched', () => {
    const mockMap = { remove: () => {} } as any;
    
    const newState = mapReducer(initialState, {
      type: 'setMap',
      payload: mockMap,
    });

    expect(newState.map).toBe(mockMap);
    expect(newState.isMapReady).toBe(true);
  });

  it('should preserve other state properties when setting map', () => {
    const mockDraw = {} as any;
    const stateWithDraw: MapState = {
      ...initialState,
      draw: mockDraw,
    };
    
    const mockMap = { remove: () => {} } as any;
    const newState = mapReducer(stateWithDraw, {
      type: 'setMap',
      payload: mockMap,
    });

    expect(newState.draw).toBe(mockDraw);
    expect(newState.map).toBe(mockMap);
  });

  it('should return current state on unknown action', () => {
    const mockMap = { remove: () => {} } as any;
    const mockDraw = { anything: true } as any;
    const stateWithMap: MapState = {
      isMapReady: true,
      map: mockMap,
      draw: mockDraw,
    };

    // Probamos acción no válida para validar el default case
    const newState = mapReducer(stateWithMap, {
      type: 'UNKNOWN_ACTION',
      payload: null,
    } as any);

    // El reducer debe retornar el mismo estado sin modificar (misma referencia)
    expect(newState).toBe(stateWithMap);
    expect(newState.isMapReady).toBe(true);
    expect(newState.map).toBe(mockMap);
    expect(newState.draw).toBe(mockDraw);
  });
});
