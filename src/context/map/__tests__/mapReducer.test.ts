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
});
