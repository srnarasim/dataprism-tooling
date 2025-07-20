# DataPrism Tooling - Context Engineering Guide

## Project Overview

DataPrism Tooling provides the comprehensive development toolchain for the DataPrism ecosystem. It implements a CLI-first approach with modular tools for project scaffolding, building, deployment, security management, and environment validation across all DataPrism repositories.

## Architecture Context

DataPrism Tooling implements a CLI-first architecture with comprehensive development and deployment capabilities:

### Core Architecture Patterns
- **CLI-First Architecture**: Command pattern implementation with modular commands
- **Template System**: Project scaffolding with customizable templates
- **Multi-Provider Deployment**: Abstract deployment providers for different platforms
- **Security Management**: Repository protection and security validation
- **Environment Validation**: Comprehensive development environment checking

### Tool Components
- **CLI Commands**: Project initialization, building, serving, and validation
- **Template Engine**: Project scaffolding with variable substitution
- **Deployment System**: Multi-provider deployment with validation
- **Security Tools**: Repository protection and branch policies
- **Validation Tools**: Environment and dependency validation

### Repository Structure
```
dataprism-tooling/
├── packages/                   # CLI and core tooling
│   ├── src/
│   │   ├── commands/          # CLI command implementations
│   │   ├── templates/         # Project scaffolding templates
│   │   └── utils/             # Shared CLI utilities
├── tools/                     # Development and deployment tools
│   ├── build/                 # Build system tools
│   ├── deployment/            # Multi-provider deployment system
│   ├── security/              # Repository security management
│   └── validation/            # Environment validation tools
├── scripts/                   # Utility scripts
└── tests/                     # Comprehensive test suites
```

## Core Technologies

- **CLI Framework**: Commander.js for command structure and argument parsing
- **Template Engine**: Handlebars for project scaffolding with variable substitution
- **Deployment Providers**: GitHub Pages, Cloudflare, Netlify, Vercel integration
- **Security Management**: GitHub API integration for repository protection
- **Environment Validation**: Node.js, Rust, and build dependency checking
- **Build Integration**: Vite, webpack, and wasm-pack integration

## Development Principles

### CLI-First Design

- Consistent command structure and argument patterns
- Interactive prompts for complex configurations
- Clear error messages and user guidance
- Cross-platform compatibility (Windows, macOS, Linux)

### Modular Architecture

- Pluggable command system with clear interfaces
- Reusable components across different commands
- Template-driven project generation
- Provider abstraction for deployment targets

### Developer Experience

- Fast command execution and response times
- Comprehensive help and documentation
- Intelligent defaults with override capabilities
- Progress indicators for long-running operations

### Quality Assurance

- Comprehensive validation before operations
- Environment compatibility checking
- Build verification and testing integration
- Security policy enforcement

## Context Engineering Rules

### CLI Command Development

- Always implement the Command interface with consistent lifecycle
- Provide both interactive and non-interactive modes
- Validate prerequisites before executing operations
- Use consistent error handling and user feedback patterns

### Template System

- Use Handlebars for variable substitution in templates
- Provide complete project templates for each repository type
- Include comprehensive configuration and setup
- Test all templates with automated generation

### Deployment System

- Implement provider abstraction for different deployment targets
- Validate assets and configuration before deployment
- Provide rollback capabilities where supported
- Monitor deployment health and success

### Security Management

- Enforce branch protection rules across all repositories
- Validate security policies and compliance
- Audit repository configurations regularly
- Maintain security best practices documentation

## Common Patterns to Follow

### CLI Command Implementation

```typescript
// Base command interface
interface Command {
  name: string;
  description: string;
  options: CommandOption[];
  execute(args: any, options: any): Promise<void>;
  validate?(args: any, options: any): Promise<boolean>;
}

// Example command implementation
export class InitCommand implements Command {
  name = 'init';
  description = 'Initialize a new DataPrism project';
  options = [
    { name: 'template', type: 'string', description: 'Project template' },
    { name: 'name', type: 'string', description: 'Project name' }
  ];
  
  async execute(args: any, options: any): Promise<void> {
    const config = await this.promptForConfiguration(options);
    const template = await this.selectTemplate(config.template);
    await this.generateProject(config, template);
  }
  
  async validate(args: any, options: any): Promise<boolean> {
    return this.validateEnvironment() && this.validateOptions(options);
  }
}
```

### Deployment Provider Pattern

```typescript
// Base deployment provider
export abstract class DeploymentProvider {
  abstract name: string;
  abstract description: string;
  
  // Core deployment lifecycle
  abstract authenticate(): Promise<void>;
  abstract validate(config: DeploymentConfig): Promise<ValidationResult>;
  abstract deploy(assets: DeploymentAssets, config: DeploymentConfig): Promise<DeploymentResult>;
  abstract verify(deployment: DeploymentResult): Promise<VerificationResult>;
  abstract rollback?(deploymentId: string): Promise<void>;
  
  // Common validation logic
  protected async validateAssets(assets: DeploymentAssets): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // Check file sizes and WASM limits
    for (const asset of assets.files) {
      if (asset.size > this.getMaxFileSize()) {
        errors.push(`File ${asset.path} exceeds size limit`);
      }
    }
    
    // Validate WASM files
    const wasmFiles = assets.files.filter(f => f.path.endsWith('.wasm'));
    for (const wasmFile of wasmFiles) {
      if (wasmFile.size > 6 * 1024 * 1024) { // 6MB limit
        errors.push(`WASM file ${wasmFile.path} exceeds 6MB limit`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  protected abstract getMaxFileSize(): number;
}
```

### Environment Validation Pattern

```typescript
// Development environment validator
export class EnvironmentValidator {
  async validateDevelopmentEnvironment(): Promise<EnvironmentReport> {
    const checks: EnvironmentCheck[] = await Promise.all([
      this.checkNodeVersion(),
      this.checkRustInstallation(),
      this.checkWasmPack(),
      this.checkGitConfiguration(),
      this.checkSystemResources(),
      this.checkNetworkConnectivity()
    ]);
    
    const failedChecks = checks.filter(check => !check.passed);
    
    return {
      checks,
      passed: failedChecks.length === 0,
      warnings: checks.filter(check => check.severity === 'warning'),
      recommendations: this.generateEnvironmentRecommendations(checks)
    };
  }
}
```

## Build and Testing Context

```bash
# CLI development
npm run dev:cli                # CLI development with hot reload
npm run build:cli              # Build CLI tools
npm run test:cli               # Test CLI commands

# Deployment tools
npm run build:deployment        # Build deployment tools
npm run test:deployment         # Test deployment providers
npm run validate:providers      # Validate provider configurations

# Security tools
npm run build:security          # Build security management tools
npm run test:security           # Test security validation
npm run audit:repositories      # Audit repository security

# Environment validation
npm run validate:environment    # Run environment validation
npm run check:dependencies      # Check development dependencies
npm run test:validation         # Test validation tools

# Project templates
npm run test:templates          # Test all project templates
npm run validate:templates      # Validate template configurations
```

## Template System

### Core Project Template
```typescript
export const coreProjectTemplate: ProjectTemplate = {
  name: 'dataprism-core',
  description: 'DataPrism Core WebAssembly analytics engine',
  type: 'core',
  files: [
    {
      templatePath: 'core/Cargo.toml.hbs',
      outputPath: 'Cargo.toml',
      content: cargoTomlTemplate
    },
    {
      templatePath: 'core/package.json.hbs',
      outputPath: 'package.json',
      content: packageJsonTemplate
    }
  ],
  dependencies: [
    { name: 'wasm-bindgen', version: '^0.2', type: 'rust' },
    { name: 'typescript', version: '^5.2', type: 'npm', dev: true }
  ],
  configuration: {
    wasmTarget: 'web',
    rustEdition: '2021',
    typescriptTarget: 'ES2022'
  }
};
```

## Deployment Providers

### GitHub Pages Provider
- Automated GitHub Actions integration
- Branch protection and security validation
- CDN optimization for global distribution
- Version management and rollback support

### Cloudflare Pages Provider
- Edge optimization and global CDN
- Serverless function integration
- Advanced security and DDoS protection
- Real-time analytics and monitoring

### Multi-Provider Strategy
- Primary deployment with automatic failover
- Performance comparison and optimization
- Cost analysis and resource utilization
- Compliance and security validation

## Security Management

### Repository Protection
- Branch protection rules enforcement
- Required status checks and reviews
- Security policy validation
- Audit logging and compliance reporting

### Environment Security
- Dependency vulnerability scanning
- Secret management and validation
- Access control and permissions
- Security best practices enforcement

## Communication Style

- Focus on practical CLI usage and automation
- Provide clear command examples and options
- Emphasize security best practices and validation
- Include troubleshooting guides for common deployment issues
