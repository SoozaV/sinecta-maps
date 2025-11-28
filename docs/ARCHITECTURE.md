# Architecture Overview

## Design Principles

This application follows SOLID principles and modern React best practices:

- **Separation of Concerns**: Business logic separated from UI components
- **Component Composition**: Small, reusable components
- **Custom Hooks**: Logic reusability through custom hooks
- **Type Safety**: Strict TypeScript configuration
- **State Management**: Zustand for global state, Context for provider-specific state

## Folder Structure

```
src/
├── components/           # React UI components
│   ├── Polygons.tsx      # Main polygon list orchestrator
│   ├── MapView.tsx       # Map container component
│   ├── PolygonList/      # Polygon list sub-components
│   │   └── PolygonListItem.tsx
│   ├── GeoJSONControls/  # Export/Import controls
│   │   └── GeoJSONControls.tsx
│   └── ...
├── hooks/                # Custom React hooks
│   ├── usePolygonSelection.ts    # Polygon selection state
│   ├── usePolygonOperations.ts   # CRUD operations
│   ├── usePolygonViewport.ts     # Map viewport control
│   └── usePolygonMapEvents.ts   # Map event handlers
├── stores/               # Zustand state management
│   ├── usePolygonsStore.ts       # Polygon data and operations
│   └── useGlobalStore.ts         # Global app state (loading, online)
├── context/              # React Context providers
│   ├── map/              # Map context
│   │   ├── MapContext.ts
│   │   ├── MapProvider.tsx
│   │   └── mapReducer.ts
│   └── places/           # Places context
│       ├── PlacesContext.ts
│       ├── PlacesProvider.tsx
│       └── placesReducer.ts
├── utils/                # Pure utility functions
│   ├── polygon.utils.ts  # Polygon calculations (area, bbox, etc.)
│   └── errorHandler.ts  # Error handling utilities
├── services/             # Service layer
│   └── geojson.service.ts # GeoJSON export/import
├── apis/                 # API clients
│   ├── polygonsApi.ts    # Backend API client
│   └── geocodingApi.ts   # Mapbox Geocoding API
├── types/                # TypeScript type definitions
│   └── polygon.types.ts
├── constants/            # Configuration constants
│   ├── map.constants.ts
│   └── polygon.constants.ts
└── screens/              # Screen-level components
    └── HomeScreen.tsx
```

## Key Components

### Polygons.tsx

The main orchestrator for the polygon list UI. Uses 4 custom hooks:

- `usePolygonSelection` - Manages active polygon selection state
- `usePolygonOperations` - Handles create/delete operations
- `usePolygonViewport` - Controls map viewport (fitBounds)
- `usePolygonMapEvents` - Handles map and draw events

**Responsibilities:**
- Render polygon list UI
- Handle polygon creation from map draw events
- Coordinate selection and viewport updates
- Display empty state when no polygons exist

### MapView.tsx

Container component for the Mapbox GL map instance.

**Responsibilities:**
- Initialize Mapbox GL map
- Provide map instance to MapContext
- Handle map lifecycle (mount/unmount)

### PolygonListItem.tsx

Individual polygon item in the list.

**Responsibilities:**
- Display polygon name, address, and area
- Handle selection click
- Handle delete action
- Show active state styling

### GeoJSONControls.tsx

Export/Import controls for GeoJSON persistence.

**Responsibilities:**
- Export current polygons to GeoJSON file
- Import GeoJSON file and replace polygons
- Provide user feedback (success/error messages)
- Update map with imported polygons

## Custom Hooks

### usePolygonSelection

Manages polygon selection state.

**State:**
- `activePolygon`: Currently selected polygon with index

**Methods:**
- `selectPolygon(polygon, index)`: Select polygon from list
- `selectPolygonFromMap()`: Select polygon from map draw selection

**Dependencies:**
- MapContext (draw instance)
- usePolygonsStore (to find polygon index)

### usePolygonOperations

Handles CRUD operations for polygons.

**Methods:**
- `createPolygon(polygon)`: Create new polygon (with graceful backend error handling)
- `deletePolygon(polygon, index)`: Delete polygon from store and map

**Features:**
- Graceful degradation: continues locally if backend fails
- Automatic ID generation for temporary polygons
- Updates both store and map draw instance

**Dependencies:**
- MapContext (draw instance)
- usePolygonsStore (update/delete methods)
- polygonsApi (backend calls)

### usePolygonViewport

Controls map viewport to focus on polygons.

**Methods:**
- `centerPolygon(feature)`: Fit map bounds to polygon

**Dependencies:**
- MapContext (map instance)
- MAP_CONFIG (padding constants)

### usePolygonMapEvents

Handles map and draw plugin events.

**Responsibilities:**
- Load polygons on map load
- Handle map click events
- Handle draw.create events

**Dependencies:**
- MapContext (map, draw instances)
- usePolygonsStore (loadFirstPolygons)

## State Management Strategy

### Zustand Stores

**usePolygonsStore:**
- Global polygon data (FeatureCollection)
- Polygon operations (create, update, delete, replace)
- Automatic area calculation
- Geocoding integration for addresses

**useGlobalStore:**
- Loading states
- Online/offline status
- Global app configuration

**Optimization:**
- Uses selectors to prevent unnecessary re-renders
- Granular subscriptions (components only subscribe to needed data)

### React Context

**MapContext:**
- Map instance (Mapbox GL Map)
- Draw instance (Mapbox Draw)
- Map ready state
- setMap method

**PlacesContext:**
- Places/addresses data
- Geocoding results

### Local State (useState)

Used for UI-specific state:
- Form inputs
- Modal visibility
- Temporary UI state
- Component-specific selections

## Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook
    ↓
Store/Context Update
    ↓
API Call (if needed)
    ↓
Store Update
    ↓
UI Re-render
```

### Example: Creating a Polygon

1. User draws polygon on map
2. Mapbox Draw fires `draw.create` event
3. `usePolygonMapEvents` hook catches event
4. `Polygons` component calls `createPolygon()`
5. `usePolygonOperations` hook:
   - Updates polygon properties (name, area)
   - Attempts backend API call (graceful on failure)
   - Updates `usePolygonsStore`
   - Returns created polygon
6. Component selects and centers new polygon
7. UI re-renders with new polygon in list

## Performance Optimizations

1. **React.memo**: Applied to all list items and pure components
2. **useCallback**: All event handlers wrapped to prevent re-renders
3. **Zustand Selectors**: Components subscribe only to needed state slices
4. **Lazy Loading**: Routes loaded on demand (if routing added)
5. **Memoization**: Expensive calculations cached (area, bbox)

## Testing Strategy

### Unit Tests
- **Utils**: Pure functions (polygon calculations, error handling)
- **Services**: GeoJSON export/import logic
- **Hooks**: Custom hooks with mocked dependencies

### Component Tests
- **React Testing Library**: User interaction testing
- **Mocked Mapbox**: Mapbox GL and Draw fully mocked
- **Snapshot Tests**: For complex UI components

### Integration Tests
- **User Flows**: Complete workflows (create → edit → delete)
- **API Integration**: Mock API responses

### Coverage Goals
- Lines: >70% (target >80%)
- Branches: >60%
- Functions: >70%

## Future Backend Integration

### Current State
- Zustand store for local state
- Export/Import GeoJSON for persistence
- Graceful backend error handling (continues locally)

### Planned API Endpoints

```
GET    /api/polygons           # Fetch all polygons
POST   /api/polygons           # Create polygon
PUT    /api/polygons/:id       # Update polygon
DELETE /api/polygons/:id       # Delete polygon
```

### Migration Strategy

1. **Phase 1**: Current export/import (temporary persistence)
2. **Phase 2**: Add API calls alongside export/import
3. **Phase 3**: Replace export/import with API-only (optional backup)
4. **Phase 4**: Add real-time sync (WebSockets, optional)

### API Integration Points

- `usePolygonOperations.createPolygon()`: Already has API call with graceful fallback
- `usePolygonOperations.deletePolygon()`: Already has API call
- `usePolygonsStore.loadFirstPolygons()`: Already loads from API on mount
- `usePolygonsStore.replacePolygons()`: For import, could sync to backend

## Error Handling

### Strategy
- **User-facing**: Toast/alert messages for user actions
- **Developer-facing**: Console errors with context
- **Graceful Degradation**: App continues working if backend unavailable

### Error Types
- **API Errors**: Handled by `errorHandler.ts` (AppError class)
- **Network Errors**: Detected and handled gracefully
- **Validation Errors**: GeoJSON validation before import
- **Map Errors**: Mapbox errors logged, app continues

## Dependencies

### Core
- **React 19.2**: UI framework
- **TypeScript 5.9**: Type safety
- **Vite 7.2**: Build tool and dev server

### Mapping
- **Mapbox GL JS 2.11**: Map rendering
- **Mapbox Draw 1.3**: Polygon drawing/editing
- **Turf.js 7.1**: Geospatial calculations

### State Management
- **Zustand 5.0**: Global state
- **React Context**: Provider-specific state

### Testing
- **Vitest 4.0**: Test runner
- **Testing Library**: Component testing
- **jsdom**: DOM environment for tests

## Build & Deployment

### Development
- Vite dev server on port 3000
- Hot module replacement
- Source maps enabled

### Production
- Vite build with optimizations
- Code splitting
- Asset optimization
- Deployed to Vercel (auto-deploy on push to main)

### Environment Variables
- `VITE_MAPBOX_ACCESS_TOKEN`: Required for map rendering
- `VITE_MAPBOX_GEOCODING_TOKEN`: Optional, for geocoding

## Security Considerations

1. **Mapbox Tokens**: Public tokens only (pk.*), never secret tokens
2. **Input Validation**: GeoJSON validation before processing
3. **XSS Prevention**: React's built-in XSS protection
4. **CORS**: Handled by backend API configuration

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- No IE11 support (as per browserslist config)

