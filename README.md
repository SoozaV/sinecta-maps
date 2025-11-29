# 🗺️ Sinecta Maps

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18.svg)](https://vitest.dev/)

> Professional React + TypeScript application for drawing, editing, and managing polygons on interactive maps using Mapbox GL JS.

![Demo GIF](./docs/demo.gif)

## ✨ Features

- 🎨 **Draw custom polygons** with Mapbox Draw
- ✏️ **Edit vertices and shapes** interactively
- 🗑️ **Delete polygons** with one click
- 📏 **Calculate area and perimeter** automatically
- 📥 **Export/Import GeoJSON** for data persistence
- 🎯 **Responsive and mobile-friendly** design
- 🔍 **Geocoding integration** for address lookup
- 📍 **Real-time polygon selection** and highlighting

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Mapbox Access Token ([Get one here](https://account.mapbox.com/access-tokens/))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/sinecta-maps.git
cd sinecta-maps/sinecta-maps-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Mapbox token to .env
# VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Tech Stack

- **React 19.2** + **TypeScript 5.9** - Modern UI with type safety
- **Vite 7.2** - Fast build tool and dev server
- **Mapbox GL JS 2.11** + **Mapbox Draw 1.3** - Interactive mapping
- **Zustand 5.0** - Lightweight state management
- **Turf.js 7.1** - Geospatial calculations
- **Vitest 4.0** - Fast unit testing
- **Axios 1.2** - HTTP client

## 📊 Code Quality

- ✅ **Test Coverage**: >70% coverage with 92 tests
- ✅ **TypeScript**: Strict mode enabled
- ✅ **ESLint**: React 19 + TypeScript plugins
- ✅ **Error Handling**: Centralized interceptors with offline detection

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── Polygons.tsx  # Main polygon list
│   ├── MapView.tsx   # Map component
│   ├── PolygonList/  # Polygon list sub-components
│   └── GeoJSONControls/  # Import/Export controls
├── hooks/            # Custom React hooks
│   ├── usePolygonSelection.ts
│   ├── usePolygonOperations.ts
│   ├── usePolygonViewport.ts
│   └── usePolygonMapEvents.ts
├── stores/           # Zustand stores
│   ├── usePolygonsStore.ts  # Polygons state
│   └── useGlobalStore.ts    # Loading & online/offline
├── context/          # React Context providers
│   ├── map/          # MapContext and provider
│   └── places/       # PlacesContext and provider
├── interceptors/     # Axios interceptors
│   ├── error.interceptor.ts    # Error handling & offline detection
│   └── loading.interceptor.ts  # Global loading state
├── apis/             # API clients
│   ├── polygonsApi.ts   # Backend API with auth
│   └── geocodingApi.ts  # Mapbox Geocoding
├── services/         # Service layer
│   └── geojson.service.ts  # GeoJSON validation
├── utils/            # Utility functions
│   ├── polygon.utils.ts    # Area, perimeter calculations
│   └── errorHandler.ts     # Error utilities
├── screens/          # Page components
│   └── HomeScreen.tsx
├── types/            # TypeScript definitions
├── constants/        # Configuration values
└── helpers/          # Helper functions
```

## 🧪 Testing

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once with coverage
npm run test:coverage

# Run tests once (CI mode)
npm run test:run
```

### Testing Strategy

- **Unit tests** for utilities and hooks
- **Component tests** with React Testing Library
- **Integration tests** for user flows
- **Mocked Mapbox** for isolated testing

## 🚀 Deployment

The application is automatically deployed to Vercel on push to `main` branch.

### Manual Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Configure these in your deployment platform:

- `VITE_MAPBOX_ACCESS_TOKEN` - Mapbox public access token (required)
- `VITE_MAPBOX_GEOCODING_TOKEN` - Mapbox geocoding token (optional, fallback to main token)
- `VITE_BASE_URL` - Backend API URL (e.g., http://localhost:3000)
- `VITE_API_KEY` - API key for backend authentication (X-API-Key header)

## 📖 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md) - Detailed architecture documentation
- [Documentation Structure](./docs/ESTRUCTURA_DOCUMENTACION.md) - Documentation organization

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report
- `npm run test:run` - Run tests once (CI mode)

### Code Style

This project uses ESLint with TypeScript and React plugins. Run linting:

```bash
npx eslint . --ext .ts,.tsx
```

## 📝 License

This project is licensed under the MIT License.

---

Built with ❤️ using React, TypeScript, and Mapbox GL JS
