# Propuesta de Estructura de Documentación

## Objetivo

Crear documentación técnica detallada pero concisa para el repositorio público, similar a `.cursor/rules/` pero más resumida y enfocada en uso práctico.

## Estructura Propuesta

```
docs/
├── ARCHITECTURE.md              # ✅ Ya existe - Arquitectura general
├── demo.gif                     # ⚠️ Pendiente - Demo visual
├── MODULES.md                   # 📝 Nuevo - Documentación de módulos principales
├── API.md                       # 📝 Nuevo - Documentación de APIs y servicios
├── HOOKS.md                     # 📝 Nuevo - Documentación de custom hooks
└── COMPONENTS.md                # 📝 Nuevo - Documentación de componentes clave
```

## Contenido Sugerido por Archivo

### MODULES.md

**Propósito**: Documentar módulos principales del sistema

**Secciones**:
1. **State Management**
   - `usePolygonsStore` - Store de polígonos
   - `useGlobalStore` - Estado global (loading, online/offline)
   - `MapContext` - Contexto del mapa
   - `PlacesContext` - Contexto de lugares

2. **Services**
   - `geojson.service.ts` - Export/Import GeoJSON
   - `errorHandler.ts` - Manejo de errores

3. **APIs**
   - `polygonsApi.ts` - Cliente backend
   - `geocodingApi.ts` - Cliente Mapbox Geocoding
   - Interceptores (error, loading)

**Formato**: Más conciso que `.cursor/rules`, enfocado en:
- Propósito del módulo
- Funciones principales
- Ejemplos de uso
- Dependencias

### API.md

**Propósito**: Documentar integraciones con APIs externas

**Secciones**:
1. **Backend API** (`VITE_BASE_URL`)
   - Endpoints disponibles
   - Manejo de errores
   - Graceful degradation

2. **Mapbox APIs**
   - Mapbox GL JS (renderizado)
   - Mapbox Draw (dibujo)
   - Mapbox Geocoding (direcciones)
   - Tokens y configuración

**Formato**: Tablas de endpoints, ejemplos de requests/responses

### HOOKS.md

**Propósito**: Documentar custom hooks

**Secciones**:
1. **Polygon Hooks**
   - `usePolygonSelection` - Selección de polígonos
   - `usePolygonOperations` - CRUD operations
   - `usePolygonViewport` - Control de viewport
   - `usePolygonMapEvents` - Eventos del mapa

2. **Utility Hooks**
   - `useWindowDimension` - Dimensiones de ventana

**Formato**: Para cada hook:
- Propósito
- Parámetros
- Retorno
- Ejemplo de uso
- Notas importantes

### COMPONENTS.md

**Propósito**: Documentar componentes principales

**Secciones**:
1. **Core Components**
   - `Polygons.tsx` - Orquestador principal
   - `MapView.tsx` - Contenedor del mapa
   - `PolygonListItem.tsx` - Item de lista

2. **Utility Components**
   - `ErrorBoundary.tsx` - Manejo de errores React
   - `Loading.tsx` - Indicador de carga
   - `GeoJSONControls.tsx` - Controles de export/import

**Formato**: Para cada componente:
- Props
- Responsabilidades
- Uso típico
- Dependencias

## Comparación con `.cursor/rules/`

| Aspecto | `.cursor/rules/` | `docs/` |
|---------|------------------|---------|
| **Audiencia** | IA/Desarrolladores internos | Público/Contribuidores |
| **Detalle** | Muy detallado | Resumido pero completo |
| **Ejemplos** | Código completo | Ejemplos concisos |
| **Estructura** | Por módulo/archivo | Por funcionalidad |
| **Propósito** | Memoria de contexto | Documentación de uso |

## Recomendación

**Opción A: Estructura Modular (Recomendada)**
- `MODULES.md` - Módulos principales
- `API.md` - Integraciones externas
- `HOOKS.md` - Custom hooks
- `COMPONENTS.md` - Componentes

**Ventajas**:
- Fácil de mantener
- Búsqueda rápida por tema
- No duplica información de `ARCHITECTURE.md`

**Opción B: Estructura Monolítica**
- `MODULES.md` - Todo en un solo archivo

**Desventajas**:
- Archivo muy largo
- Difícil de navegar
- Menos mantenible

## Próximos Pasos

1. ✅ Aprobar estructura propuesta
2. 📝 Crear `MODULES.md` con contenido inicial
3. 📝 Crear `API.md` con documentación de APIs
4. 📝 Crear `HOOKS.md` con documentación de hooks
5. 📝 Crear `COMPONENTS.md` con documentación de componentes
6. 🔗 Actualizar `README.md` con links a nueva documentación

## Notas

- Mantener consistencia con `ARCHITECTURE.md`
- Incluir ejemplos de código cuando sea útil
- Referenciar archivos fuente cuando sea relevante
- Mantener actualizado con cambios en el código

