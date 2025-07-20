# DataPrism Tooling Architecture

## Overview

DataPrism Tooling provides the comprehensive development toolchain for the DataPrism ecosystem. It implements a CLI-first approach with modular tools for project scaffolding, building, deployment, security management, and environment validation across all DataPrism repositories.

## Repository Structure

```
dataprism-tooling/
├── packages/                   # CLI and core tooling
│   ├── src/
│   │   ├── commands/          # CLI command implementations
│   │   │   ├── init.ts        # Project scaffolding
│   │   │   ├── build.ts       # Build orchestration
│   │   │   ├── serve.ts       # Development server
│   │   │   ├── validate.ts    # Environment validation
│   │   │   └── plugin.ts      # Plugin development tools
│   │   ├── templates/         # Project scaffolding templates
│   │   │   ├── core/          # DataPrism Core templates
│   │   │   ├── plugin/        # Plugin development templates
│   │   │   └── app/           # Application templates
│   │   └── utils/             # Shared CLI utilities
├── tools/                     # Development and deployment tools
│   ├── build/                 # Build system tools
│   │   ├── plugin-manifest.ts # Plugin manifest generation
│   │   ├── asset-bundler.ts   # Asset bundling utilities
│   │   └── wasm-optimizer.ts  # WASM-specific optimizations
│   ├── deployment/            # Multi-provider deployment system
│   │   ├── base-provider.ts   # Abstract deployment provider
│   │   ├── providers/         # Provider implementations
│   │   │   ├── github-pages.ts
│   │   │   ├── cloudflare.ts
│   │   │   ├── netlify.ts
│   │   │   └── vercel.ts
│   │   ├── validator.ts       # Pre-deployment validation
│   │   └── deploy.ts          # Main deployment orchestrator
│   ├── security/              # Repository security management
│   │   ├── repository-protection.ts # GitHub protection rules
│   │   ├── protection-validator.js  # Security validation
│   │   └── branch-policies.ts      # Branch protection policies
│   └── validation/            # Environment validation tools
│       ├── environment-validator.ts # Dev environment checks
│       └── environment-cli.ts      # Validation CLI interface
├── scripts/                   # Utility scripts
│   ├── check-cdn-sizes.js     # CDN asset size monitoring
│   ├── validate-packages.js   # Package validation
│   └── post-build-core.js     # Post-build processing
└── tests/                     # Comprehensive test suites
    ├── cli/                   # CLI command testing
    ├── tools/                 # Tool functionality testing
    └── deployment/            # Deployment system testing
```

## Core Architecture Patterns

### 1. CLI-First Architecture

#### **Command Pattern Implementation**
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
    // Interactive project scaffolding
    const config = await this.promptForConfiguration(options);
    const template = await this.selectTemplate(config.template);
    await this.generateProject(config, template);
  }
  
  async validate(args: any, options: any): Promise<boolean> {
    // Validate prerequisites and options
    return this.validateEnvironment() && this.validateOptions(options);
  }
}
```

#### **CLI Orchestration Pattern**
```typescript
// Main CLI coordinator
export class DataPrismCLI {
  private commands: Map<string, Command> = new Map();
  
  constructor() {
    this.registerCommands([
      new InitCommand(),
      new BuildCommand(),
      new ServeCommand(),
      new ValidateCommand(),
      new PluginCommand()
    ]);
  }
  
  async execute(argv: string[]): Promise<void> {
    const { command, args, options } = this.parseArguments(argv);
    const commandImpl = this.commands.get(command);
    
    if (!commandImpl) {
      throw new Error(`Unknown command: ${command}`);
    }
    
    // Validate before execution
    if (commandImpl.validate && !await commandImpl.validate(args, options)) {
      throw new Error('Command validation failed');
    }
    
    // Execute with proper error handling
    await this.executeWithErrorHandling(commandImpl, args, options);
  }
}
```

### 2. Template and Scaffolding System

#### **Template Engine Architecture**
```typescript
// Template definition interface
interface ProjectTemplate {
  name: string;
  description: string;
  type: 'core' | 'plugin' | 'app' | 'tooling';
  files: TemplateFile[];
  dependencies: TemplateDependency[];
  configuration: TemplateConfiguration;
}

// Template processing engine
export class TemplateEngine {
  async generateProject(template: ProjectTemplate, config: ProjectConfig): Promise<void> {
    // Create project directory structure
    await this.createDirectoryStructure(template, config);
    
    // Process template files with variable substitution
    await this.processTemplateFiles(template.files, config);
    
    // Install dependencies
    await this.installDependencies(template.dependencies, config);
    
    // Apply configuration
    await this.applyConfiguration(template.configuration, config);
    
    // Post-generation setup
    await this.runPostGenerationHooks(template, config);
  }
  
  private async processTemplateFiles(files: TemplateFile[], config: ProjectConfig): Promise<void> {
    for (const file of files) {
      const content = await this.renderTemplate(file.content, config);
      const outputPath = this.resolvePath(file.outputPath, config);
      await fs.writeFile(outputPath, content);
    }
  }
}
```

#### **Template Configurations**
```typescript
// Core project template
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
      templatePath: 'core/src/lib.rs.hbs',
      outputPath: 'src/lib.rs',
      content: libRsTemplate
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

// Plugin template
export const pluginTemplate: ProjectTemplate = {
  name: 'dataprism-plugin',
  description: 'DataPrism plugin with TypeScript and optional WASM',
  type: 'plugin',
  files: [
    {
      templatePath: 'plugin/src/plugin.ts.hbs',
      outputPath: 'src/{{pluginName}}-plugin.ts',
      content: pluginTsTemplate
    },
    {
      templatePath: 'plugin/tests/plugin.test.ts.hbs',
      outputPath: 'tests/{{pluginName}}.test.ts',
      content: pluginTestTemplate
    }
  ],
  dependencies: [
    { name: '@dataprism/plugins', version: '^1.0.0', type: 'npm' },
    { name: 'vitest', version: '^1.6.0', type: 'npm', dev: true }
  ],
  configuration: {
    pluginType: 'data-processor',
    includeWasm: false,
    includeWorker: false
  }
};
```

### 3. Multi-Provider Deployment System

#### **Provider Abstraction Pattern**
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
    
    // Check file sizes
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

#### **Provider Implementations**
```typescript
// GitHub Pages provider
export class GitHubPagesProvider extends DeploymentProvider {
  name = 'github-pages';
  description = 'Deploy to GitHub Pages with Actions integration';
  
  async authenticate(): Promise<void> {
    // GitHub token validation
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable required');
    }
    
    await this.validateGitHubAccess(token);
  }
  
  async deploy(assets: DeploymentAssets, config: DeploymentConfig): Promise<DeploymentResult> {
    // GitHub Pages specific deployment logic
    const deployment = await this.createGitHubPagesDeployment(assets, config);
    
    return {
      id: deployment.id,
      url: deployment.page_url,
      status: 'success',
      provider: this.name,
      timestamp: new Date().toISOString()
    };
  }
  
  protected getMaxFileSize(): number {
    return 100 * 1024 * 1024; // 100MB
  }
}

// Cloudflare Pages provider
export class CloudflarePagesProvider extends DeploymentProvider {
  name = 'cloudflare-pages';
  description = 'Deploy to Cloudflare Pages with edge optimization';
  
  async deploy(assets: DeploymentAssets, config: DeploymentConfig): Promise<DeploymentResult> {
    // Cloudflare specific deployment with edge optimization
    const deployment = await this.createCloudflareDeployment(assets, config);
    
    return {
      id: deployment.id,
      url: deployment.url,
      status: 'success',
      provider: this.name,
      timestamp: new Date().toISOString(),
      metadata: {
        edgeLocations: deployment.edge_locations,
        optimizationApplied: true
      }
    };
  }
  
  protected getMaxFileSize(): number {
    return 25 * 1024 * 1024; // 25MB
  }
}
```

#### **Deployment Orchestration**
```typescript
// Main deployment coordinator
export class DeploymentManager {
  private providers: Map<string, DeploymentProvider> = new Map();
  
  constructor() {
    this.registerProviders([
      new GitHubPagesProvider(),
      new CloudflarePagesProvider(),
      new NetlifyProvider(),
      new VercelProvider()
    ]);
  }
  
  async deploy(
    providerName: string, 
    assets: DeploymentAssets, 
    config: DeploymentConfig
  ): Promise<DeploymentResult> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unknown deployment provider: ${providerName}`);
    }
    
    // Pre-deployment validation
    await provider.authenticate();
    const validation = await provider.validate(config);
    
    if (!validation.isValid) {
      throw new Error(`Deployment validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Execute deployment with retry logic
    return await this.executeWithRetry(
      () => provider.deploy(assets, config),
      { maxRetries: 3, backoffMs: 1000 }
    );
  }
}
```

### 4. Security Management System

#### **Repository Protection Automation**
```typescript
// GitHub repository security management
export class RepositorySecurityManager {
  private octokit: Octokit;
  
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }
  
  async applySecurityPolicies(repo: Repository): Promise<void> {
    // Apply branch protection rules
    await this.applyBranchProtection(repo);
    
    // Configure security settings
    await this.configureSecuritySettings(repo);
    
    // Set up required status checks
    await this.configureStatusChecks(repo);
    
    // Apply file size restrictions
    await this.configureFileSizeRestrictions(repo);
  }
  
  private async applyBranchProtection(repo: Repository): Promise<void> {
    const protection = {
      required_status_checks: {
        strict: true,
        contexts: ['ci/tests', 'ci/lint', 'ci/security-scan']
      },
      enforce_admins: true,
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: true,
        require_code_owner_reviews: true
      },
      restrictions: null,
      allow_force_pushes: false,
      allow_deletions: false
    };
    
    await this.octokit.rest.repos.updateBranchProtection({
      owner: repo.owner,
      repo: repo.name,
      branch: 'main',
      ...protection
    });
  }
}
```

#### **Security Validation Tools**
```typescript
// Security policy validation
export class SecurityValidator {
  async validateRepositorySettings(repo: Repository): Promise<SecurityReport> {
    const checks: SecurityCheck[] = [
      await this.checkBranchProtection(repo),
      await this.checkSecurityPolicies(repo),
      await this.checkDependencyScanning(repo),
      await this.checkCodeScanning(repo),
      await this.checkSecretScanning(repo)
    ];
    
    const failedChecks = checks.filter(check => !check.passed);
    
    return {
      repository: repo,
      checks,
      passed: failedChecks.length === 0,
      score: this.calculateSecurityScore(checks),
      recommendations: this.generateRecommendations(failedChecks)
    };
  }
  
  private async checkBranchProtection(repo: Repository): Promise<SecurityCheck> {
    try {
      const protection = await this.octokit.rest.repos.getBranchProtection({
        owner: repo.owner,
        repo: repo.name,
        branch: 'main'
      });
      
      return {
        name: 'Branch Protection',
        passed: true,
        details: 'Main branch is properly protected',
        severity: 'high'
      };
    } catch (error) {
      return {
        name: 'Branch Protection',
        passed: false,
        details: 'Main branch lacks protection rules',
        severity: 'high',
        remediation: 'Apply branch protection rules via repository settings'
      };
    }
  }
}
```

### 5. Environment Validation System

#### **Comprehensive Environment Checking**
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
  
  private async checkNodeVersion(): Promise<EnvironmentCheck> {
    const requiredVersion = '18.0.0';
    const currentVersion = process.version.slice(1); // Remove 'v' prefix
    
    if (semver.gte(currentVersion, requiredVersion)) {
      return {
        name: 'Node.js Version',
        passed: true,
        details: `Node.js ${currentVersion} meets requirement (>= ${requiredVersion})`,
        severity: 'info'
      };
    } else {
      return {
        name: 'Node.js Version',
        passed: false,
        details: `Node.js ${currentVersion} is below required ${requiredVersion}`,
        severity: 'error',
        remediation: `Upgrade Node.js to version ${requiredVersion} or higher`
      };
    }
  }
  
  private async checkWasmPack(): Promise<EnvironmentCheck> {
    try {
      const { stdout } = await execAsync('wasm-pack --version');
      const version = stdout.trim().split(' ')[1];
      
      return {
        name: 'wasm-pack',
        passed: true,
        details: `wasm-pack ${version} is installed`,
        severity: 'info'
      };
    } catch (error) {
      return {
        name: 'wasm-pack',
        passed: false,
        details: 'wasm-pack is not installed or not in PATH',
        severity: 'error',
        remediation: 'Install wasm-pack: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh'
      };
    }
  }
}
```

### 6. Build System Integration

#### **Asset Optimization Pipeline**
```typescript
// Build system coordinator
export class BuildOrchestrator {
  async buildProject(projectType: ProjectType, config: BuildConfig): Promise<BuildResult> {
    const pipeline = this.createBuildPipeline(projectType);
    
    try {
      // Execute build pipeline stages
      const results = await this.executePipeline(pipeline, config);
      
      // Optimize outputs
      const optimizedAssets = await this.optimizeAssets(results.assets);
      
      // Generate manifests
      const manifests = await this.generateManifests(optimizedAssets);
      
      return {
        success: true,
        assets: optimizedAssets,
        manifests,
        metadata: results.metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        assets: [],
        manifests: {},
        metadata: {}
      };
    }
  }
  
  private createBuildPipeline(projectType: ProjectType): BuildStage[] {
    switch (projectType) {
      case 'core':
        return [
          new RustCompilationStage(),
          new WasmOptimizationStage(),
          new TypeScriptCompilationStage(),
          new BundleGenerationStage()
        ];
      
      case 'plugin':
        return [
          new PluginValidationStage(),
          new TypeScriptCompilationStage(),
          new PluginBundleStage(),
          new ManifestGenerationStage()
        ];
      
      case 'app':
        return [
          new DependencyInstallationStage(),
          new AssetProcessingStage(),
          new ViteBuildStage(),
          new OptimizationStage()
        ];
      
      default:
        throw new Error(`Unknown project type: ${projectType}`);
    }
  }
}
```

### 7. Testing and Quality Assurance

#### **CLI Testing Framework**
```typescript
// CLI command testing utilities
export class CLITestFramework {
  async testCommand(
    command: string, 
    args: string[], 
    options: CLITestOptions = {}
  ): Promise<CLITestResult> {
    const { cwd = process.cwd(), env = {}, timeout = 30000 } = options;
    
    try {
      const startTime = Date.now();
      const { stdout, stderr, exitCode } = await this.executeCommand(
        command, 
        args, 
        { cwd, env, timeout }
      );
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        executionTime,
        command: [command, ...args].join(' ')
      };
    } catch (error) {
      return {
        success: false,
        exitCode: error.code || -1,
        stdout: '',
        stderr: error.message,
        executionTime: 0,
        command: [command, ...args].join(' '),
        error: error.message
      };
    }
  }
  
  async testProjectGeneration(template: string, projectName: string): Promise<void> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dataprism-test-'));
    
    try {
      // Test project generation
      const initResult = await this.testCommand('dataprism', ['init', projectName], {
        cwd: tempDir,
        env: { DATAPRISM_TEMPLATE: template }
      });
      
      expect(initResult.success).toBe(true);
      
      // Verify project structure
      const projectDir = path.join(tempDir, projectName);
      await this.verifyProjectStructure(projectDir, template);
      
      // Test build
      const buildResult = await this.testCommand('npm', ['run', 'build'], {
        cwd: projectDir
      });
      
      expect(buildResult.success).toBe(true);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}
```

## Future Architecture Considerations

### 1. Advanced CLI Features
- Interactive project configuration with rich UI
- Plugin marketplace integration from CLI
- Real-time build monitoring and progress visualization
- AI-powered project optimization suggestions

### 2. Enhanced Deployment Capabilities
- Multi-region deployment coordination
- Blue-green deployment strategies
- Performance monitoring integration
- Automated rollback triggers based on metrics

### 3. Developer Experience Improvements
- Visual Studio Code extension integration
- IntelliSense support for DataPrism APIs
- Integrated debugging tools for WASM development
- Performance profiling and optimization tools

### 4. Enterprise Features
- Team collaboration tools and shared configurations
- CI/CD pipeline templates and automation
- Compliance reporting and audit trails
- Custom deployment provider SDK

This architecture provides a comprehensive toolchain that streamlines DataPrism development while maintaining flexibility for diverse deployment scenarios and development workflows.