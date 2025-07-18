# DataPrism Tooling

DataPrism Tooling provides CLI tools, build configurations, deployment automation, and development utilities for the DataPrism ecosystem.

## Features

- **CLI Interface**: Command-line tools for development and deployment
- **Build System**: Shared configurations for Vite, TypeScript, Rust
- **Deployment Tools**: CDN deployment and release automation
- **Project Scaffolding**: Quick project and plugin creation
- **Environment Validation**: Dependency and environment checking

## Installation

```bash
npm install -g @dataprism/tooling
```

## CLI Usage

```bash
# Create new project
dataprism create my-analytics-app

# Create new plugin
dataprism create plugin my-plugin

# Build project
dataprism build

# Deploy to CDN
dataprism deploy

# Validate environment
dataprism validate
```

## Development

```bash
# Install dependencies
npm install

# Build CLI and tools
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

## Architecture

- **cli**: Command-line interface and commands
- **build**: Shared build configurations
- **deployment**: CDN and release tools
- **validation**: Environment validation
- **templates**: Project scaffolding templates

## License

MIT
