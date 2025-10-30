# 🤝 Contributing to BlockSecure Chain

Thank you for your interest in contributing to BlockSecure Chain! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Community](#community)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python 3.11+ (for Slither)
- Git
- A code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**

   Click the "Fork" button on the [BlockSecure Chain GitHub repository](https://github.com/bandidood/blocksecure-chain)

2. **Clone your fork**

   ```bash
   git clone https://github.com/<YOUR_USERNAME>/blocksecure-chain.git
   cd blocksecure-chain
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/bandidood/blocksecure-chain.git
   ```

4. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

5. **Install Slither**

   ```bash
   pip3 install slither-analyzer
   ```

6. **Run tests to verify setup**

   ```bash
   npm test
   ```

## Project Structure

BlockSecure Chain is organized as a monorepo with multiple packages:

```
blocksecure-chain/
├── packages/
│   ├── contracts/      # Solidity smart contracts
│   ├── analyzer/       # Vulnerability analysis engine
│   ├── backend/        # Express REST API
│   ├── frontend/       # React dashboard
│   └── subgraph/       # The Graph indexing
├── docs/               # Documentation
├── scripts/            # Utility scripts
├── .github/            # GitHub Actions workflows
└── README.md           # Main documentation
```

### Package Responsibilities

| Package | Purpose | Tech Stack |
|---------|---------|------------|
| **contracts** | On-chain security oracle | Solidity, Hardhat, OpenZeppelin |
| **analyzer** | Automated vulnerability detection | TypeScript, Slither |
| **backend** | REST API for Web3 integration | Express, TypeScript, Ethers.js |
| **frontend** | User interface | React, Vite, RainbowKit, Wagmi |
| **subgraph** | Event indexing | The Graph, GraphQL |

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for a bugfix
git checkout -b fix/issue-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### 2. Make Changes

Follow the [Coding Standards](#coding-standards) and keep your changes focused on a single purpose.

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Test specific package
cd packages/contracts
npm test

# Run integration tests
bash scripts/integration-test.sh
```

### 4. Commit Your Changes

Follow our [Commit Conventions](#commit-conventions):

```bash
git add .
git commit -m "feat(contracts): add emergency pause mechanism"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### TypeScript/JavaScript

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications.

#### General Rules

```typescript
// ✅ Good
export class SecurityAnalyzer {
  private readonly config: AnalyzerConfig;

  constructor(config: AnalyzerConfig) {
    this.config = config;
  }

  public async analyze(contractPath: string): Promise<AnalysisResult> {
    // Implementation
  }
}

// ❌ Bad
export class securityAnalyzer {
  config;

  constructor(config) {
    this.config = config;
  }

  analyze(contractPath) {
    // Implementation
  }
}
```

#### Naming Conventions

- **Classes**: PascalCase (`SecurityOracle`, `VulnerabilityAnalyzer`)
- **Functions/Methods**: camelCase (`reportVulnerability`, `scanContract`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`, `MAX_RETRIES`)
- **Interfaces**: PascalCase with `I` prefix (`IAnalyzer`, `IConfig`)
- **Types**: PascalCase (`AnalysisResult`, `VulnerabilityType`)

#### Code Formatting

```bash
# Format code with Prettier
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Solidity

Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html).

#### Best Practices

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ContractName
 * @dev Contract description
 */
contract ContractName is AccessControl {
    // State variables
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 private _counter;

    // Events
    event CounterIncremented(uint256 newValue);

    // Modifiers
    modifier onlyWhenActive() {
        require(isActive, "Contract is not active");
        _;
    }

    // Constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // External functions
    function increment() external onlyRole(ADMIN_ROLE) {
        _counter++;
        emit CounterIncremented(_counter);
    }

    // Public functions
    function getCounter() public view returns (uint256) {
        return _counter;
    }

    // Internal functions
    function _resetCounter() internal {
        _counter = 0;
    }

    // Private functions
    function _calculateHash(uint256 value) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(value));
    }
}
```

### React/Frontend

#### Component Structure

```tsx
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export const ComponentName: React.FC<Props> = ({ title, onSubmit }) => {
  const [data, setData] = useState<FormData | null>(null);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Effect logic
  }, [address]);

  const handleSubmit = () => {
    if (data) {
      onSubmit(data);
    }
  };

  return (
    <div className="container">
      <h2>{title}</h2>
      {/* Component JSX */}
    </div>
  );
};
```

#### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for prop types
- Handle loading and error states
- Add accessibility attributes

## Testing Guidelines

### Test Structure

```typescript
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SecurityOracle', () => {
  let securityOracle: SecurityOracle;
  let owner: SignerWithAddress;
  let auditor: SignerWithAddress;

  beforeEach(async () => {
    [owner, auditor] = await ethers.getSigners();
    
    const SecurityOracle = await ethers.getContractFactory('SecurityOracle');
    securityOracle = await SecurityOracle.deploy();
    await securityOracle.deployed();
  });

  describe('Vulnerability Reporting', () => {
    it('should allow reporter to report vulnerability', async () => {
      // Arrange
      const address = '0x1234...';
      const vulnType = 0; // REENTRANCY
      const severity = 3; // CRITICAL

      // Act
      const tx = await securityOracle.reportVulnerability(
        address,
        vulnType,
        severity,
        'Test vulnerability'
      );
      const receipt = await tx.wait();

      // Assert
      expect(receipt.status).to.equal(1);
    });

    it('should revert if description is empty', async () => {
      await expect(
        securityOracle.reportVulnerability('0x1234...', 0, 3, '')
      ).to.be.revertedWith('Description required');
    });
  });
});
```

### Testing Requirements

- **Smart Contracts**: Minimum 90% code coverage
- **Backend**: Unit tests for all controllers and services
- **Frontend**: Component tests with React Testing Library
- **Integration**: End-to-end tests for critical paths

### Running Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific package
cd packages/contracts
npm test
```

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements
- **ci**: CI/CD changes

### Scopes

- `contracts`: Smart contract changes
- `analyzer`: Analyzer package
- `backend`: Backend API
- `frontend`: Frontend application
- `subgraph`: The Graph subgraph
- `docs`: Documentation
- `ci`: CI/CD workflows

### Examples

```bash
# Feature
git commit -m "feat(contracts): add pause mechanism to SecurityOracle"

# Bug fix
git commit -m "fix(backend): resolve CORS issue with frontend requests"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(contracts)!: change audit report structure

BREAKING CHANGE: AuditReport struct now includes timestamp field"
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one approval required
3. **Testing**: Changes must be tested
4. **Documentation**: Updates must be documented

### After Approval

Your PR will be merged by a maintainer. Thank you for your contribution!

## Reporting Issues

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Update to latest version** to see if issue persists
3. **Gather relevant information** (error messages, logs, etc.)

### Issue Template

```markdown
## Bug Report

**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Node.js: [e.g., 18.17.0]
- npm: [e.g., 9.6.7]
- Browser: [e.g., Chrome 120]

**Additional Context**
Any other relevant information
```

### Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:

1. Email security@blocksecure.chain (or create private disclosure)
2. Include detailed description
3. Wait for acknowledgment before disclosure

## Feature Requests

We welcome feature suggestions!

### Feature Request Template

```markdown
## Feature Request

**Problem**
Describe the problem this feature would solve

**Proposed Solution**
Describe your proposed solution

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Any other relevant information
```

## Community

### Getting Help

- **Documentation**: Check [README](./README.md) and [docs/](./docs/)
- **Issues**: Search existing GitHub issues
- **Discussions**: GitHub Discussions for Q&A

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code contributions

### Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## Development Tips

### Useful Commands

```bash
# Install all dependencies
npm install --legacy-peer-deps

# Build all packages
npm run build

# Clean build artifacts
npm run clean

# Format all code
npm run format

# Lint all code
npm run lint

# Run integration tests
bash scripts/integration-test.sh
```

### VS Code Setup

Recommended extensions:

- ESLint
- Prettier
- Solidity
- GitLens
- Error Lens

### Debugging

```bash
# Debug smart contracts
npx hardhat console --network localhost

# Debug backend
npm run dev --inspect

# View logs
docker-compose logs -f
```

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://react.dev/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## Questions?

If you have questions not covered in this guide, please:

1. Check existing documentation
2. Search GitHub issues and discussions
3. Create a new discussion on GitHub

Thank you for contributing to BlockSecure Chain! 🛡️

---

**Remember**: Every contribution counts, whether it's code, documentation, bug reports, or feature suggestions. We appreciate your help in making BlockSecure Chain better!
