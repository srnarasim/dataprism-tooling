# DataPrism Tooling - Context Engineering Guide

## Project Overview
DataPrism Tooling provides CLI tools, build configurations, deployment automation, and development utilities for the DataPrism ecosystem.

## Architecture Context
- **CLI Interface**: Command-line tools for development and deployment
- **Build System**: Shared configurations for Vite, TypeScript, Rust
- **Deployment Tools**: CDN deployment and release automation
- **Validation**: Environment and dependency validation

## Development Patterns
- Use Commander.js for CLI structure
- Implement cross-platform compatibility
- Follow consistent error handling patterns
- Provide clear user feedback and validation

## Testing Requirements
- CLI command testing across platforms
- Build configuration validation
- Deployment automation testing
- Environment validation testing

## Build Commands
```bash
# Build CLI tools
npm run build:cli

# Build deployment tools
npm run build:deployment

# Run tests
npm run test:cli && npm run test:deployment
```
