# 🗺️ Sinecta Maps

[![CI](https://github.com/USERNAME/sinecta-maps/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/sinecta-maps/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black.svg)](https://sinecta-maps.vercel.app/)

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
git clone https://github.com/USERNAME/sinecta-maps.git
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

The app will be available at `http://localhost:3000`

## 🏗️ Tech Stack

- **React 19.2** + **TypeScript 5.9** - Modern UI with type safety
- **Vite 7.2** - Fast build tool and dev server
- **Mapbox GL JS 2.11** + **Mapbox Draw 1.3** - Interactive mapping
- **Zustand 5.0** - Lightweight state management
- **Turf.js 7.1** - Geospatial calculations
- **Vitest 4.0** - Fast unit testing
- **Axios 1.2** - HTTP client

## 📊 Code Quality

- ✅ **Test Coverage**: >70% (target >80%)
- ✅ **TypeScript**: Strict mode enabled
- ✅ **ESLint**: Zero warnings
- ✅ **CI/CD**: Automated testing and deployment with GitHub Actions

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── Polygons.tsx  # Main polygon list
│   ├── MapView.tsx   # Map component
│   └── PolygonList/  # Polygon list sub-components
├── hooks/            # Custom React hooks
│   ├── usePolygonSelection.ts
│   ├── usePolygonOperations.ts
│   ├── usePolygonViewport.ts
│   └── usePolygonMapEvents.ts
├── stores/           # Zustand stores
│   ├── usePolygonsStore.ts
│   └── useGlobalStore.ts
├── context/          # React Context providers
│   ├── MapContext.ts
│   └── PlacesContext.ts
├── utils/            # Utility functions
│   ├── polygon.utils.ts
│   └── errorHandler.ts
├── services/         # Service layer
│   └── geojson.service.ts
├── apis/             # API clients
│   ├── polygonsApi.ts
│   └── geocodingApi.ts
├── types/            # TypeScript definitions
└── constants/        # Configuration values
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
- `VITE_MAPBOX_GEOCODING_TOKEN` - Mapbox geocoding token (optional, can use same as above)

## 📖 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md) - Detailed architecture documentation
- [API Integration](./docs/API.md) - Backend API integration (coming soon)

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

[Your Name](https://github.com/USERNAME)

---

**Note**: Replace `USERNAME` in badges and links with your actual GitHub username.
