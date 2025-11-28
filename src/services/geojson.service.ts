/**
 * GeoJSON Service
 * Handles export and import of GeoJSON FeatureCollection files
 */

/**
 * Validates if data is a valid GeoJSON FeatureCollection
 */
export function validateGeoJSON(data: any): data is GeoJSON.FeatureCollection {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (data.type !== 'FeatureCollection') {
    return false;
  }

  if (!Array.isArray(data.features)) {
    return false;
  }

  // Validate each feature
  for (const feature of data.features) {
    if (!feature || typeof feature !== 'object') {
      return false;
    }

    if (feature.type !== 'Feature') {
      return false;
    }

    if (!feature.geometry || typeof feature.geometry !== 'object') {
      return false;
    }

    // Only support Polygon geometry type for now
    if (feature.geometry.type !== 'Polygon') {
      return false;
    }

    if (!Array.isArray(feature.geometry.coordinates)) {
      return false;
    }
  }

  return true;
}

/**
 * Exports a FeatureCollection to a downloadable GeoJSON file
 */
export function exportToFile(featureCollection: GeoJSON.FeatureCollection): void {
  try {
    const jsonString = JSON.stringify(featureCollection, null, 2);
    const blob = new Blob([jsonString], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `sinecta-polygons-${timestamp}.geojson`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Failed to export GeoJSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Imports a GeoJSON file and returns a validated FeatureCollection
 */
export async function importFromFile(file: File): Promise<GeoJSON.FeatureCollection> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.geojson') && !file.name.endsWith('.json')) {
      reject(new Error('File must be a GeoJSON file (.geojson or .json)'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (!validateGeoJSON(data)) {
          reject(new Error('Invalid GeoJSON format. Expected FeatureCollection with Polygon features.'));
          return;
        }

        resolve(data);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Invalid JSON format'));
        } else {
          reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

