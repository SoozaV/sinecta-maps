import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolygonListItem } from '../PolygonList/PolygonListItem';
import { createTestPolygon } from '../../setupTests';

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

    const areaText = screen.getByText(/Area:/);
    expect(areaText).toBeInTheDocument();
    expect(areaText.textContent).toContain('1,234.56');
    expect(areaText.textContent).toContain('m²');
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

    const listItem = screen.getByRole('listitem');
    const deleteButton = screen.getByRole('button');
    
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    
    fireEvent(deleteButton, clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
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
});

