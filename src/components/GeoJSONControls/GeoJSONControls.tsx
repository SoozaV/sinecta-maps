import { useState, useRef } from 'react';
import { usePolygonsStore } from '../../stores/usePolygonsStore';
import { exportToFile, importFromFile } from '../../services/geojson.service';
import { MapContext } from '../../context';
import { useContext } from 'react';

export const GeoJSONControls = () => {
  const { polygons, replacePolygons } = usePolygonsStore();
  const { draw } = useContext(MapContext);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      if (polygons.features.length === 0) {
        setMessage({ type: 'error', text: 'No polygons to export' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      exportToFile(polygons);
      setMessage({ type: 'success', text: 'GeoJSON exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to export GeoJSON',
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const importedData = await importFromFile(file);

      if (importedData.features.length === 0) {
        setMessage({ type: 'error', text: 'Imported file contains no polygons' });
        setIsImporting(false);
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // Replace polygons in store
      replacePolygons(importedData);

      // Update map with imported polygons
      if (draw) {
        draw.set(importedData);
      }

      setMessage({
        type: 'success',
        text: `Successfully imported ${importedData.features.length} polygon(s)!`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import GeoJSON',
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="geojson-controls" style={{ padding: '1rem', borderTop: '1px solid #dee2e6' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: message ? '0.5rem' : '0' }}>
        <button
          onClick={handleExport}
          className="btn btn-sm btn-outline-primary"
          style={{ flex: 1 }}
          disabled={polygons.features.length === 0}
        >
          📥 Export GeoJSON
        </button>
        <button
          onClick={handleImportClick}
          className="btn btn-sm btn-outline-secondary"
          style={{ flex: 1 }}
          disabled={isImporting}
        >
          {isImporting ? '⏳ Importing...' : '📤 Import GeoJSON'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".geojson,.json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {message && (
        <div
          className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
          role="alert"
          style={{ marginBottom: 0, fontSize: '0.875rem', padding: '0.5rem' }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

