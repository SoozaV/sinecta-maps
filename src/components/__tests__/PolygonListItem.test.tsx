import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolygonListItem } from '../PolygonList/PolygonListItem';
import { createTestPolygon } from '../../setupTests';

// Mock de las funciones de utils
const { mockCalculatePolygonPerimeter, mockGetVertexCount, mockFormatArea, mockFormatDistance } = vi.hoisted(() => {
  const mockCalculatePolygonPerimeter = vi.fn((_polygon: GeoJSON.Feature<GeoJSON.Polygon>) => 1234.56);
  const mockGetVertexCount = vi.fn((_polygon: GeoJSON.Feature<GeoJSON.Polygon>) => 5);
  const mockFormatArea = vi.fn((area: number) => `${area.toLocaleString()} m²`);
  const mockFormatDistance = vi.fn((distance: number) => `${(distance / 1000).toFixed(2)} km`);
  
  return { mockCalculatePolygonPerimeter, mockGetVertexCount, mockFormatArea, mockFormatDistance };
});

vi.mock('../../utils/polygon.utils', () => ({
  calculatePolygonPerimeter: mockCalculatePolygonPerimeter,
  getVertexCount: mockGetVertexCount,
  formatArea: mockFormatArea,
  formatDistance: mockFormatDistance,
}));

describe('PolygonListItem', () => {
  const mockOnSelect = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultProps = {
    polygon: createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1'),
    index: 0,
    isActive: false,
    onSelect: mockOnSelect,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Resetear valores de retorno de los mocks
    mockFormatArea.mockReturnValue('1,234.56 m²');
    mockFormatDistance.mockReturnValue('1.23 km');
    mockGetVertexCount.mockReturnValue(5);
  });

  it('should render polygon name and address', () => {
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    polygon.properties = {
      name: 'Test Field',
      place_name: 'Test Location, City',
      area: 1000,
    };

    render(<PolygonListItem {...defaultProps} polygon={polygon} />);

    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByText('Test Location, City')).toBeInTheDocument();
  });

  it('should display formatted area', () => {
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    polygon.properties = {
      name: 'Test Field',
      area: 1234.56,
    };

    render(<PolygonListItem {...defaultProps} polygon={polygon} />);

    const areaText = screen.getByText(/📐 Área:/);
    expect(areaText).toBeInTheDocument();
    expect(mockFormatArea).toHaveBeenCalledWith(1234.56);
    expect(areaText.textContent).toContain('m²');
  });

  it('should display formatted perimeter', () => {
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    polygon.properties = {
      name: 'Test Field',
      area: 1000,
    };

    render(<PolygonListItem {...defaultProps} polygon={polygon} />);

    const perimeterText = screen.getByText(/📏 Perímetro:/);
    expect(perimeterText).toBeInTheDocument();
    expect(mockCalculatePolygonPerimeter).toHaveBeenCalledWith(expect.objectContaining({ id: 'polygon-1' }));
    expect(mockFormatDistance).toHaveBeenCalledWith(1234.56);
    expect(perimeterText.textContent).toContain('1.23 km');
  });

  it('should display vertex count', () => {
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    polygon.properties = {
      name: 'Test Field',
      area: 1000,
    };

    render(<PolygonListItem {...defaultProps} polygon={polygon} />);

    const vertexText = screen.getByText(/📍 Vértices:/);
    expect(vertexText).toBeInTheDocument();
    expect(mockGetVertexCount).toHaveBeenCalledWith(expect.objectContaining({ id: 'polygon-1' }));
    expect(vertexText.textContent).toContain('5');
  });

  it('should call onSelect when item is clicked', () => {
    render(<PolygonListItem {...defaultProps} />);

    const listItem = screen.getByRole('listitem');
    fireEvent.click(listItem);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<PolygonListItem {...defaultProps} />);

    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should stop propagation when delete button is clicked', () => {
    render(<PolygonListItem {...defaultProps} />);

    const deleteButton = screen.getByRole('button');
    
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    
    fireEvent(deleteButton, clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should have delete-polygon class on delete button', () => {
    render(<PolygonListItem {...defaultProps} />);

    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toHaveClass('delete-polygon');
  });

  it('should apply active class when isActive is true', () => {
    render(<PolygonListItem {...defaultProps} isActive={true} />);

    const listItem = screen.getByRole('listitem');
    expect(listItem.className).toContain('active');
  });

  it('should not apply active class when isActive is false', () => {
    render(<PolygonListItem {...defaultProps} isActive={false} />);

    const listItem = screen.getByRole('listitem');
    expect(listItem.className).not.toContain('active');
  });

  it('should have correct data attributes', () => {
    render(<PolygonListItem {...defaultProps} />);

    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveAttribute('data-index', '0');
    expect(listItem).toHaveAttribute('id', 'polygon-1');
  });

  it('should handle missing place_name gracefully', () => {
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    polygon.properties = {
      name: 'Test Field',
      area: 1000,
    };

    render(<PolygonListItem {...defaultProps} polygon={polygon} />);

    expect(screen.getByText('Test Field')).toBeInTheDocument();
  });

  it('should handle undefined properties gracefully', () => {
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    (polygon as any).properties = undefined;

    render(<PolygonListItem {...defaultProps} polygon={polygon} />);

    // El componente no debe romperse, aunque no renderice nombre
    const listItem = screen.getByRole('listitem');
    expect(listItem).toBeInTheDocument();
    // Área debería ser 0 (fallback)
    expect(mockFormatArea).toHaveBeenCalledWith(0);
  });

  it('should handle empty properties object gracefully', () => {
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    polygon.properties = {};

    render(<PolygonListItem {...defaultProps} polygon={polygon} />);

    const listItem = screen.getByRole('listitem');
    expect(listItem).toBeInTheDocument();
    // Área debería ser 0 (fallback)
    expect(mockFormatArea).toHaveBeenCalledWith(0);
  });

  it('should display area as 0m² when area property is missing', () => {
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    polygon.properties = {
      name: 'Test Field',
      // Sin area
    };

    mockFormatArea.mockReturnValue('0 m²');

    render(<PolygonListItem {...defaultProps} polygon={polygon} />);

    const areaText = screen.getByText(/📐 Área:/);
    expect(mockFormatArea).toHaveBeenCalledWith(0);
    expect(areaText.textContent).toContain('0 m²');
  });

  it('should memoize metrics and not recalculate on re-render with same polygon', () => {
    const polygon = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    polygon.properties = {
      name: 'Test Field',
      area: 1000,
    };

    const { rerender } = render(<PolygonListItem {...defaultProps} polygon={polygon} />);

    // Limpiar llamadas del primer render
    vi.clearAllMocks();

    // Re-renderizar con el mismo polígono (misma referencia)
    rerender(<PolygonListItem {...defaultProps} polygon={polygon} />);

    // Las funciones de cálculo NO deberían llamarse de nuevo (memoización)
    expect(mockCalculatePolygonPerimeter).not.toHaveBeenCalled();
    expect(mockGetVertexCount).not.toHaveBeenCalled();
    expect(mockFormatArea).not.toHaveBeenCalled();
    expect(mockFormatDistance).not.toHaveBeenCalled();
  });

  it('should recalculate metrics when polygon changes', () => {
    const polygon1 = createTestPolygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], 'polygon-1');
    polygon1.properties = { name: 'Field 1', area: 1000 };

    const polygon2 = createTestPolygon([[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]], 'polygon-2');
    polygon2.properties = { name: 'Field 2', area: 2000 };

    const { rerender } = render(<PolygonListItem {...defaultProps} polygon={polygon1} />);

    // Limpiar llamadas del primer render
    vi.clearAllMocks();

    // Re-renderizar con un polígono diferente
    rerender(<PolygonListItem {...defaultProps} polygon={polygon2} />);

    // Las funciones de cálculo DEBERÍAN llamarse de nuevo
    expect(mockCalculatePolygonPerimeter).toHaveBeenCalledTimes(1);
    expect(mockGetVertexCount).toHaveBeenCalledTimes(1);
    expect(mockFormatArea).toHaveBeenCalledWith(2000);
  });
});
