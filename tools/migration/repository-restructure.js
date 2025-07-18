#!/usr/bin/env node

/**
 * DataPrism Repository Restructure Implementation
 * 
 * This script implements the repository restructure strategy from PRP DRRE-2025-001,
 * transforming the monorepo into a modular 4-repository ecosystem.
 * 
 * @author DataPrism Architecture Team
 * @version 1.0.0
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DataPrismRepositoryRestructure {
  constructor() {
    this.projectRoot = join(__dirname, '../../..');
    this.tempDir = join(this.projectRoot, 'temp-restructure');
    console.log(`Project root: ${this.projectRoot}`);
    console.log(`Temp directory: ${this.tempDir}`);
    this.repositories = [
      {
        name: 'dataprism-core',
        description: 'DataPrism Core Platform (WASM + Orchestration)',
        components: ['packages/core', 'packages/orchestration']
      },
      {
        name: 'dataprism-plugins',
        description: 'DataPrism Plugin Framework and Official Plugins',
        components: ['packages/plugins']
      },
      {
        name: 'dataprism-tooling',
        description: 'DataPrism CLI, Build Tools, and Development Utilities',
        components: ['packages/cli', 'tools/build', 'tools/deployment', 'tools/validation']
      },
      {
        name: 'dataprism-apps',
        description: 'DataPrism Demo Apps, Documentation, and Marketplace',
        components: ['apps/demo-analytics', 'apps/docs', 'examples']
      }
    ];
  }

  /**
   * Execute command with proper error handling
   */
  execCommand(command, options = {}) {
    try {
      console.log(`Executing: ${command}`);
      const result = execSync(command, { 
        encoding: 'utf8',
        cwd: options.cwd || this.projectRoot,
        ...options
      });
      return result;
    } catch (error) {
      console.error(`Command failed: ${command}`);
      console.error(error.message);
      throw error;
    }
  }

  /**
   * Create repository structure
   */
  createRepositoryStructure() {
    console.log('🏗️  Creating repository structure...');
    
    // Create temp directory for restructuring
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }

    // Create each repository directory
    this.repositories.forEach(repo => {
      const repoDir = join(this.tempDir, repo.name);
      
      // Create base directory structure
      mkdirSync(repoDir, { recursive: true });
      mkdirSync(join(repoDir, '.github/workflows'), { recursive: true });
      mkdirSync(join(repoDir, 'PRPs'), { recursive: true });
      mkdirSync(join(repoDir, 'docs'), { recursive: true });
      mkdirSync(join(repoDir, 'tests'), { recursive: true });
      
      console.log(`✓ Created repository structure: ${repo.name}`);
    });
  }

  /**
   * Create repository-specific CLAUDE.md files
   */
  createClaudeContextFiles() {
    console.log('📝 Creating Claude context files...');

    // Core platform context
    const coreContext = `# DataPrism Core - Context Engineering Guide

## Project Overview
DataPrism Core is the foundational platform combining Rust WebAssembly engine with TypeScript orchestration for high-performance browser-based analytics.

## Architecture Context
- **Core WASM Engine**: Rust-based WebAssembly module with DuckDB integration
- **TypeScript Orchestration**: Coordination layer for API management
- **Performance Targets**: <2s query response, <6MB WASM bundles
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Development Patterns
- Use wasm-bindgen for JavaScript interop
- Implement proper memory management
- Handle WebAssembly compilation errors gracefully
- Optimize for browser memory constraints

## Testing Requirements
- Rust unit tests with cargo test
- TypeScript tests with Vitest
- Integration tests for WASM-JS interactions
- Performance benchmarks for core operations

## Build Commands
\`\`\`bash
# Build WASM core
wasm-pack build packages/wasm --target web

# Build orchestration
npm run build:orchestration

# Run tests
cargo test && npm run test:orchestration
\`\`\`
`;

    // Plugin ecosystem context
    const pluginsContext = `# DataPrism Plugins - Context Engineering Guide

## Project Overview
DataPrism Plugins contains the plugin framework and all official plugins, enabling extensible analytics capabilities through a secure, performant plugin system.

## Architecture Context
- **Plugin Framework**: Core SDK and architecture for plugin development
- **Official Plugins**: Formula engine, file connectors, visualization, LLM providers
- **Security Model**: Sandboxing, permissions, resource quotas
- **Multi-Bundle Build**: Single repository produces multiple plugin bundles

## Development Patterns
- Extend DataPrismPlugin abstract class
- Implement proper plugin lifecycle management
- Follow security boundaries and permission model
- Use shared framework utilities for common operations

## Testing Requirements
- Plugin framework tests
- Individual plugin unit tests
- Security boundary validation
- Plugin compatibility testing

## Build Commands
\`\`\`bash
# Build plugin framework
npm run build:framework

# Build all plugins
npm run build:plugins

# Run tests
npm run test:framework && npm run test:plugins
\`\`\`
`;

    // Tooling context
    const toolingContext = `# DataPrism Tooling - Context Engineering Guide

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
\`\`\`bash
# Build CLI tools
npm run build:cli

# Build deployment tools
npm run build:deployment

# Run tests
npm run test:cli && npm run test:deployment
\`\`\`
`;

    // Applications context
    const appsContext = `# DataPrism Applications - Context Engineering Guide

## Project Overview
DataPrism Applications contains demo applications, documentation portal, plugin marketplace, and usage examples for the DataPrism ecosystem.

## Architecture Context
- **Demo Application**: React-based analytics demo showcasing capabilities
- **Documentation Portal**: VitePress-based unified documentation
- **Plugin Marketplace**: Registry and discovery for plugins
- **Examples**: Usage examples and tutorials

## Development Patterns
- Use React for interactive applications
- Follow responsive design principles
- Implement proper error boundaries
- Optimize for user experience and accessibility

## Testing Requirements
- React component testing
- E2E testing for user flows
- Documentation link validation
- Marketplace API testing

## Build Commands
\`\`\`bash
# Build demo application
npm run build:demo

# Build documentation
npm run build:docs

# Build marketplace
npm run build:marketplace

# Run tests
npm run test:demo && npm run test:docs
\`\`\`
`;

    // Write context files
    writeFileSync(join(this.tempDir, 'dataprism-core/CLAUDE.md'), coreContext);
    writeFileSync(join(this.tempDir, 'dataprism-plugins/CLAUDE.md'), pluginsContext);
    writeFileSync(join(this.tempDir, 'dataprism-tooling/CLAUDE.md'), toolingContext);
    writeFileSync(join(this.tempDir, 'dataprism-apps/CLAUDE.md'), appsContext);

    console.log('✓ Created Claude context files for all repositories');
  }

  /**
   * Create CI/CD workflows for each repository
   */
  createCIWorkflows() {
    console.log('🔄 Creating CI/CD workflows...');

    // Core platform CI/CD
    const coreWorkflow = `name: Core Platform CI/CD
on: [push, pull_request]

jobs:
  rust-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          components: clippy, rustfmt
      - name: Cache Cargo dependencies
        uses: actions/cache@v3
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: \${{ runner.os }}-cargo-\${{ hashFiles('**/Cargo.lock') }}
      - name: Build WASM
        run: wasm-pack build packages/wasm --target web
      - name: Run Rust tests
        run: cargo test
      - name: Lint Rust code
        run: cargo clippy -- -D warnings
      - name: Format check
        run: cargo fmt -- --check
  
  typescript-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build orchestration
        run: npm run build:orchestration
      - name: Run TypeScript tests
        run: npm run test:orchestration
      - name: Type check
        run: npm run type-check
      - name: Lint TypeScript
        run: npm run lint:ts
  
  integration-tests:
    needs: [rust-build, typescript-build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: Install dependencies
        run: npm ci
      - name: Build all
        run: npm run build:all
      - name: Run integration tests
        run: npm run test:integration
      - name: Performance benchmarks
        run: npm run test:performance
`;

    // Plugin ecosystem CI/CD
    const pluginsWorkflow = `name: Plugin Ecosystem CI/CD
on: [push, pull_request]

jobs:
  framework-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build plugin framework
        run: npm run build:framework
      - name: Run framework tests
        run: npm run test:framework
      - name: Security tests
        run: npm run test:security
      - name: Type check
        run: npm run type-check
      - name: Lint code
        run: npm run lint
  
  plugins-build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        plugin: [formula-engine, file-connectors, visualization, llm-providers, semantic-clustering, performance-monitor]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build plugin framework
        run: npm run build:framework
      - name: Build plugin - \${{ matrix.plugin }}
        run: npm run build:plugin -- \${{ matrix.plugin }}
      - name: Test plugin - \${{ matrix.plugin }}
        run: npm run test:plugin -- \${{ matrix.plugin }}
      - name: Validate plugin manifest
        run: npm run validate:plugin -- \${{ matrix.plugin }}
  
  plugin-compatibility:
    needs: [framework-build, plugins-build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build all
        run: npm run build:all
      - name: Test plugin compatibility
        run: npm run test:plugin-compatibility
      - name: Bundle size check
        run: npm run size-check:plugins
`;

    // Tooling CI/CD
    const toolingWorkflow = `name: Tooling CI/CD
on: [push, pull_request]

jobs:
  cli-build:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build CLI
        run: npm run build:cli
      - name: Test CLI commands
        run: npm run test:cli
      - name: Test project scaffolding
        run: npm run test:scaffolding
      - name: Lint code
        run: npm run lint
  
  build-tools:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build tools
        run: npm run build:tools
      - name: Test build configurations
        run: npm run test:build-configs
      - name: Test deployment tools
        run: npm run test:deployment
  
  environment-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Test environment validation
        run: npm run test:environment
      - name: Validate package dependencies
        run: npm run validate:dependencies
`;

    // Applications CI/CD
    const appsWorkflow = `name: Applications CI/CD
on: [push, pull_request]

jobs:
  demo-app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build demo app
        run: npm run build:demo
      - name: Test demo app
        run: npm run test:demo
      - name: E2E tests
        run: npm run test:e2e:demo
        env:
          CI: true
  
  documentation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build documentation
        run: npm run build:docs
      - name: Validate documentation links
        run: npm run validate:docs
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/dist
  
  marketplace:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build marketplace
        run: npm run build:marketplace
      - name: Test marketplace API
        run: npm run test:marketplace
      - name: Test plugin registry
        run: npm run test:registry
`;

    // Write workflow files
    writeFileSync(join(this.tempDir, 'dataprism-core/.github/workflows/ci.yml'), coreWorkflow);
    writeFileSync(join(this.tempDir, 'dataprism-plugins/.github/workflows/ci.yml'), pluginsWorkflow);
    writeFileSync(join(this.tempDir, 'dataprism-tooling/.github/workflows/ci.yml'), toolingWorkflow);
    writeFileSync(join(this.tempDir, 'dataprism-apps/.github/workflows/ci.yml'), appsWorkflow);

    console.log('✓ Created CI/CD workflows for all repositories');
  }

  /**
   * Migrate PRPs to appropriate repositories
   */
  migratePRPs() {
    console.log('📋 Migrating PRPs to repositories...');

    // Core platform PRPs
    const corePRPs = [
      'core-analytics-engine.md',
      'npm-publishing-strategy.md',
      'repository-protection-strategy.md'
    ];

    // Plugin ecosystem PRPs
    const pluginPRPs = [
      'plugin-system.md',
      'out-of-box-plugins-collection.md'
    ];

    // Tooling PRPs
    const toolingPRPs = [
      'cicd-robustness.md',
      'cdn-deployment.md'
    ];

    // Application PRPs
    const appPRPs = [
      'demo-analytics-decoupling.md',
      'analytics-demo-master-roadmap.md',
      'analytics-demo-phase1-core-functionality.md',
      'analytics-demo-phase2-enhanced-features.md',
      'analytics-demo-phase3-polish-documentation.md'
    ];

    // Copy PRPs to appropriate repositories
    const prpDir = join(this.projectRoot, 'PRPs');
    
    corePRPs.forEach(prp => {
      const srcPath = join(prpDir, prp);
      const destPath = join(this.tempDir, 'dataprism-core/PRPs', prp);
      if (existsSync(srcPath)) {
        cpSync(srcPath, destPath);
      }
    });

    pluginPRPs.forEach(prp => {
      const srcPath = join(prpDir, prp);
      const destPath = join(this.tempDir, 'dataprism-plugins/PRPs', prp);
      if (existsSync(srcPath)) {
        cpSync(srcPath, destPath);
      }
    });

    toolingPRPs.forEach(prp => {
      const srcPath = join(prpDir, prp);
      const destPath = join(this.tempDir, 'dataprism-tooling/PRPs', prp);
      if (existsSync(srcPath)) {
        cpSync(srcPath, destPath);
      }
    });

    appPRPs.forEach(prp => {
      const srcPath = join(prpDir, prp);
      const destPath = join(this.tempDir, 'dataprism-apps/PRPs', prp);
      if (existsSync(srcPath)) {
        cpSync(srcPath, destPath);
      }
    });

    console.log('✓ Migrated PRPs to appropriate repositories');
  }

  /**
   * Create repository-specific package.json files
   */
  createPackageJsonFiles() {
    console.log('📦 Creating package.json files...');

    // Core platform package.json
    const corePackage = {
      name: '@dataprism/core',
      version: '1.0.0',
      description: 'DataPrism Core Platform - WebAssembly analytics engine with TypeScript orchestration',
      type: 'module',
      main: './dist/index.js',
      types: './dist/index.d.ts',
      exports: {
        '.': './dist/index.js',
        './wasm': './dist/wasm/index.js',
        './orchestration': './dist/orchestration/index.js'
      },
      scripts: {
        'build': 'npm run build:wasm && npm run build:orchestration',
        'build:wasm': 'wasm-pack build packages/wasm --target web --out-dir ../../dist/wasm',
        'build:orchestration': 'tsc && vite build',
        'test': 'npm run test:rust && npm run test:ts',
        'test:rust': 'cargo test',
        'test:ts': 'vitest run',
        'test:integration': 'vitest run tests/integration',
        'test:performance': 'node tests/performance/benchmark.js',
        'lint': 'npm run lint:rust && npm run lint:ts',
        'lint:rust': 'cargo clippy -- -D warnings',
        'lint:ts': 'eslint "**/*.{ts,tsx}" --max-warnings 0',
        'type-check': 'tsc --noEmit',
        'dev': 'vite',
        'clean': 'rm -rf dist target'
      },
      dependencies: {
        '@duckdb/duckdb-wasm': '^1.29.1-dev132.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        'typescript': '^5.2.0',
        'vite': '^5.4.8',
        'vitest': '^1.6.0',
        'eslint': '^8.50.0',
        '@typescript-eslint/eslint-plugin': '^6.21.0',
        '@typescript-eslint/parser': '^6.21.0'
      },
      keywords: [
        'analytics',
        'webassembly',
        'duckdb',
        'data-processing',
        'wasm',
        'typescript'
      ],
      author: 'DataPrism Team',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/srnarasim/dataprism-core.git'
      }
    };

    // Plugin ecosystem package.json
    const pluginsPackage = {
      name: '@dataprism/plugins',
      version: '1.0.0',
      description: 'DataPrism Plugin Framework and Official Plugins Collection',
      type: 'module',
      main: './dist/framework/index.js',
      types: './dist/framework/index.d.ts',
      exports: {
        '.': './dist/framework/index.js',
        './framework': './dist/framework/index.js',
        './formula-engine': './dist/plugins/formula-engine/index.js',
        './file-connectors': './dist/plugins/file-connectors/index.js',
        './visualization': './dist/plugins/visualization/index.js',
        './llm-providers': './dist/plugins/llm-providers/index.js',
        './semantic-clustering': './dist/plugins/semantic-clustering/index.js',
        './performance-monitor': './dist/plugins/performance-monitor/index.js'
      },
      scripts: {
        'build': 'npm run build:framework && npm run build:plugins',
        'build:framework': 'tsc && vite build --config vite.framework.config.ts',
        'build:plugins': 'vite build --config vite.plugins.config.ts',
        'build:plugin': 'vite build --config vite.plugins.config.ts --mode plugin',
        'test': 'npm run test:framework && npm run test:plugins',
        'test:framework': 'vitest run tests/framework',
        'test:plugins': 'vitest run tests/plugins',
        'test:plugin': 'vitest run tests/plugins --reporter=verbose',
        'test:security': 'vitest run tests/security',
        'test:plugin-compatibility': 'vitest run tests/compatibility',
        'lint': 'eslint "**/*.{ts,tsx}" --max-warnings 0',
        'type-check': 'tsc --noEmit',
        'size-check:plugins': 'node scripts/check-plugin-sizes.js',
        'validate:plugin': 'node scripts/validate-plugin.js',
        'dev': 'vite --config vite.framework.config.ts',
        'clean': 'rm -rf dist'
      },
      dependencies: {
        'd3': '^7.8.0',
        'plotly.js': '^2.26.0',
        'ml-kmeans': '^6.0.0',
        'papaparse': '^5.4.1'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/d3': '^7.4.0',
        '@types/papaparse': '^5.3.7',
        'typescript': '^5.2.0',
        'vite': '^5.4.8',
        'vitest': '^1.6.0',
        'eslint': '^8.50.0',
        '@typescript-eslint/eslint-plugin': '^6.21.0',
        '@typescript-eslint/parser': '^6.21.0'
      },
      peerDependencies: {
        '@dataprism/core': '^1.0.0'
      },
      keywords: [
        'plugins',
        'framework',
        'analytics',
        'visualization',
        'data-processing',
        'extensibility'
      ],
      author: 'DataPrism Team',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/srnarasim/dataprism-plugins.git'
      }
    };

    // Tooling package.json
    const toolingPackage = {
      name: '@dataprism/tooling',
      version: '1.0.0',
      description: 'DataPrism CLI, Build Tools, and Development Utilities',
      type: 'module',
      bin: {
        'dataprism': './dist/cli/bin/dataprism.js'
      },
      main: './dist/index.js',
      types: './dist/index.d.ts',
      scripts: {
        'build': 'npm run build:cli && npm run build:tools',
        'build:cli': 'tsc && npm run build:templates',
        'build:tools': 'tsc --project tsconfig.tools.json',
        'build:templates': 'node scripts/copy-templates.js',
        'test': 'npm run test:cli && npm run test:tools',
        'test:cli': 'vitest run tests/cli',
        'test:tools': 'vitest run tests/tools',
        'test:scaffolding': 'vitest run tests/scaffolding',
        'test:build-configs': 'vitest run tests/build-configs',
        'test:deployment': 'vitest run tests/deployment',
        'test:environment': 'vitest run tests/environment',
        'validate:dependencies': 'node scripts/validate-dependencies.js',
        'lint': 'eslint "**/*.{ts,tsx}" --max-warnings 0',
        'type-check': 'tsc --noEmit',
        'dev': 'tsc --watch',
        'clean': 'rm -rf dist'
      },
      dependencies: {
        'commander': '^11.1.0',
        'inquirer': '^9.2.0',
        'chalk': '^5.3.0',
        'ora': '^7.0.0',
        'fs-extra': '^11.1.0',
        'glob': '^10.3.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/inquirer': '^9.0.0',
        '@types/fs-extra': '^11.0.0',
        'typescript': '^5.2.0',
        'vitest': '^1.6.0',
        'eslint': '^8.50.0',
        '@typescript-eslint/eslint-plugin': '^6.21.0',
        '@typescript-eslint/parser': '^6.21.0'
      },
      keywords: [
        'cli',
        'build-tools',
        'deployment',
        'development',
        'tooling',
        'scaffolding'
      ],
      author: 'DataPrism Team',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/srnarasim/dataprism-tooling.git'
      }
    };

    // Applications package.json
    const appsPackage = {
      name: '@dataprism/apps',
      version: '1.0.0',
      description: 'DataPrism Demo Applications, Documentation, and Marketplace',
      type: 'module',
      private: true,
      scripts: {
        'build': 'npm run build:demo && npm run build:docs && npm run build:marketplace',
        'build:demo': 'cd demo && npm run build',
        'build:docs': 'cd docs && npm run build',
        'build:marketplace': 'cd marketplace && npm run build',
        'test': 'npm run test:demo && npm run test:docs && npm run test:marketplace',
        'test:demo': 'cd demo && npm run test',
        'test:docs': 'cd docs && npm run test',
        'test:marketplace': 'cd marketplace && npm run test',
        'test:e2e:demo': 'playwright test tests/demo',
        'test:registry': 'vitest run tests/registry',
        'validate:docs': 'node scripts/validate-docs.js',
        'lint': 'eslint "**/*.{ts,tsx}" --max-warnings 0',
        'type-check': 'tsc --noEmit',
        'dev:demo': 'cd demo && npm run dev',
        'dev:docs': 'cd docs && npm run dev',
        'dev:marketplace': 'cd marketplace && npm run dev',
        'deploy:docs': 'cd docs && npm run deploy',
        'clean': 'rm -rf demo/dist docs/dist marketplace/dist'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'vitepress': '^1.0.0',
        'vue': '^3.3.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@playwright/test': '^1.40.0',
        'typescript': '^5.2.0',
        'vite': '^5.4.8',
        'vitest': '^1.6.0',
        'eslint': '^8.50.0',
        '@typescript-eslint/eslint-plugin': '^6.21.0',
        '@typescript-eslint/parser': '^6.21.0'
      },
      keywords: [
        'demo',
        'documentation',
        'marketplace',
        'examples',
        'applications'
      ],
      author: 'DataPrism Team',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/srnarasim/dataprism-apps.git'
      }
    };

    // Write package.json files
    writeFileSync(join(this.tempDir, 'dataprism-core/package.json'), JSON.stringify(corePackage, null, 2));
    writeFileSync(join(this.tempDir, 'dataprism-plugins/package.json'), JSON.stringify(pluginsPackage, null, 2));
    writeFileSync(join(this.tempDir, 'dataprism-tooling/package.json'), JSON.stringify(toolingPackage, null, 2));
    writeFileSync(join(this.tempDir, 'dataprism-apps/package.json'), JSON.stringify(appsPackage, null, 2));

    console.log('✓ Created package.json files for all repositories');
  }

  /**
   * Create README files for each repository
   */
  createReadmeFiles() {
    console.log('📖 Creating README files...');

    // Core platform README
    const coreReadme = `# DataPrism Core

DataPrism Core is the foundational platform combining Rust WebAssembly engine with TypeScript orchestration for high-performance browser-based analytics.

## Features

- **WebAssembly Engine**: High-performance Rust-based analytics core
- **TypeScript Orchestration**: Flexible coordination layer
- **DuckDB Integration**: Powerful SQL analytics engine
- **Browser Optimized**: <2s query response, <6MB bundle size
- **Memory Efficient**: <4GB usage for 1M row datasets

## Installation

\`\`\`bash
npm install @dataprism/core
\`\`\`

## Quick Start

\`\`\`typescript
import { DataPrismCore } from '@dataprism/core';

const core = new DataPrismCore();
await core.initialize();

const result = await core.query('SELECT COUNT(*) FROM data');
console.log(result);
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Build all
npm run build

# Run tests
npm test

# Development mode
npm run dev
\`\`\`

## Architecture

- **packages/wasm**: Rust WebAssembly engine
- **packages/orchestration**: TypeScript coordination layer
- **tests/integration**: Cross-language integration tests
- **tools/build**: Build configurations and scripts

## Performance Targets

- Query response time: <2 seconds (95% of operations)
- Memory usage: <4GB for 1M row datasets
- Initialization time: <5 seconds
- Bundle size: <6MB optimized

## License

MIT
`;

    // Plugin ecosystem README
    const pluginsReadme = `# DataPrism Plugins

DataPrism Plugins contains the plugin framework and all official plugins, enabling extensible analytics capabilities through a secure, performant plugin system.

## Features

- **Plugin Framework**: Secure, performant plugin architecture
- **Official Plugins**: Formula engine, file connectors, visualization, LLM providers
- **Multi-Bundle Build**: Single repository, multiple plugin bundles
- **Security Model**: Sandboxing, permissions, resource quotas
- **Hot Reloading**: Development-friendly plugin loading

## Installation

\`\`\`bash
npm install @dataprism/plugins
\`\`\`

## Quick Start

\`\`\`typescript
import { PluginManager } from '@dataprism/plugins';
import { FormulaEnginePlugin } from '@dataprism/plugins/formula-engine';

const manager = new PluginManager();
await manager.loadPlugin(new FormulaEnginePlugin());

const result = await manager.executePlugin('formula-engine', {
  formula: 'SUM(A1:A10)'
});
\`\`\`

## Available Plugins

- **formula-engine**: Mathematical and statistical operations
- **file-connectors**: CSV, JSON, Parquet import/export
- **visualization**: Chart rendering and interaction
- **llm-providers**: OpenAI, Anthropic, local model integration
- **semantic-clustering**: Data clustering and analysis
- **performance-monitor**: System monitoring and metrics

## Development

\`\`\`bash
# Install dependencies
npm install

# Build framework and all plugins
npm run build

# Build specific plugin
npm run build:plugin -- formula-engine

# Run tests
npm test

# Test specific plugin
npm run test:plugin -- formula-engine
\`\`\`

## Plugin Development

See the [Plugin Development Guide](./docs/plugin-development.md) for creating custom plugins.

## License

MIT
`;

    // Tooling README
    const toolingReadme = `# DataPrism Tooling

DataPrism Tooling provides CLI tools, build configurations, deployment automation, and development utilities for the DataPrism ecosystem.

## Features

- **CLI Interface**: Command-line tools for development and deployment
- **Build System**: Shared configurations for Vite, TypeScript, Rust
- **Deployment Tools**: CDN deployment and release automation
- **Project Scaffolding**: Quick project and plugin creation
- **Environment Validation**: Dependency and environment checking

## Installation

\`\`\`bash
npm install -g @dataprism/tooling
\`\`\`

## CLI Usage

\`\`\`bash
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
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Build CLI and tools
npm run build

# Run tests
npm test

# Development mode
npm run dev
\`\`\`

## Architecture

- **cli**: Command-line interface and commands
- **build**: Shared build configurations
- **deployment**: CDN and release tools
- **validation**: Environment validation
- **templates**: Project scaffolding templates

## License

MIT
`;

    // Applications README
    const appsReadme = `# DataPrism Applications

DataPrism Applications contains demo applications, documentation portal, plugin marketplace, and usage examples for the DataPrism ecosystem.

## Features

- **Demo Application**: React-based analytics demo
- **Documentation Portal**: Comprehensive ecosystem documentation
- **Plugin Marketplace**: Plugin discovery and registry
- **Usage Examples**: Tutorials and integration guides

## Development

\`\`\`bash
# Install dependencies
npm install

# Build all applications
npm run build

# Run tests
npm test

# Development mode
npm run dev:demo    # Demo application
npm run dev:docs    # Documentation
npm run dev:marketplace  # Plugin marketplace
\`\`\`

## Applications

### Demo Application
Interactive analytics demo showcasing DataPrism capabilities.

### Documentation Portal
Unified documentation for the entire DataPrism ecosystem.

### Plugin Marketplace
Registry and discovery system for DataPrism plugins.

### Examples
Usage examples and integration tutorials.

## License

MIT
`;

    // Write README files
    writeFileSync(join(this.tempDir, 'dataprism-core/README.md'), coreReadme);
    writeFileSync(join(this.tempDir, 'dataprism-plugins/README.md'), pluginsReadme);
    writeFileSync(join(this.tempDir, 'dataprism-tooling/README.md'), toolingReadme);
    writeFileSync(join(this.tempDir, 'dataprism-apps/README.md'), appsReadme);

    console.log('✓ Created README files for all repositories');
  }

  /**
   * Generate ecosystem migration report
   */
  generateMigrationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'DataPrism Repository Restructure',
      prp: 'DRRE-2025-001',
      repositories_created: this.repositories.length,
      repositories: this.repositories.map(repo => ({
        name: repo.name,
        description: repo.description,
        components: repo.components,
        structure: {
          claude_context: true,
          prps: true,
          ci_workflows: true,
          package_json: true,
          readme: true,
          docs: true,
          tests: true
        }
      })),
      implementation_status: 'infrastructure_complete',
      next_steps: [
        'Copy source code to appropriate repositories',
        'Test individual repository builds',
        'Validate CI/CD workflows',
        'Create GitHub repositories',
        'Set up inter-repository dependencies'
      ]
    };

    const reportPath = join(this.tempDir, 'migration-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 Migration Report Generated');
    console.log('='.repeat(50));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Repositories Created: ${report.repositories_created}`);
    console.log('\nRepositories:');
    report.repositories.forEach(repo => {
      console.log(`  ✓ ${repo.name}: ${repo.description}`);
    });
    console.log(`\nReport saved to: ${reportPath}`);

    return report;
  }

  /**
   * Main implementation method
   */
  async implement() {
    console.log('🚀 Starting DataPrism Repository Restructure Implementation');
    console.log('='.repeat(70));

    try {
      // Phase 1: Infrastructure Setup
      this.createRepositoryStructure();
      this.createClaudeContextFiles();
      this.createCIWorkflows();
      this.migratePRPs();
      this.createPackageJsonFiles();
      this.createReadmeFiles();

      // Generate migration report
      const report = this.generateMigrationReport();

      console.log('\n✅ Repository restructure infrastructure completed successfully!');
      console.log('\nNext Steps:');
      console.log('1. Review generated repositories in temp-restructure/');
      console.log('2. Copy source code to appropriate repositories');
      console.log('3. Test individual repository builds');
      console.log('4. Create GitHub repositories');
      console.log('5. Set up inter-repository dependencies');

      return report;

    } catch (error) {
      console.error('\n❌ Repository restructure implementation failed:');
      console.error(error.message);
      throw error;
    }
  }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0] || 'implement';

const restructure = new DataPrismRepositoryRestructure();

switch (command) {
  case 'implement':
    restructure.implement().catch(process.exit);
    break;
  default:
    console.log('Usage: node repository-restructure.js [implement]');
    process.exit(1);
}