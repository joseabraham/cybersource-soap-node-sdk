# Contributing to CyberSource SOAP Node.js SDK

Thank you for your interest in contributing to this project! This guide will help you get started with contributing to the CyberSource SOAP Node.js SDK.

## 🤝 Code of Conduct

By participating in this project, you are expected to uphold our code of conduct:

- Be respectful and inclusive
- Focus on what is best for the community
- Show empathy towards other community members
- Be collaborative
- Gracefully accept constructive criticism

## 🐛 Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue template** if provided
3. **Provide clear, detailed information** including:
   - Node.js version
   - SDK version
   - Operating system
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Error messages (if any)

### Security Issues

**Do NOT create public issues for security vulnerabilities.** Instead, please email the maintainers directly or create a private security advisory.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- Git
- A CyberSource sandbox account for testing

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/cybersource-soap-node-sdk.git
   cd cybersource-soap-node-sdk
   ```

3. **Add the upstream remote**:

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/cybersource-soap-node-sdk.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

## 💻 Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-new-payment-method`
- `fix/handle-timeout-errors`
- `docs/update-api-examples`
- `test/improve-coverage`

### Making Changes

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards (see below)

3. **Add tests** for your changes:
   - Unit tests for new functions/methods
   - Integration tests for API interactions
   - Update existing tests if behavior changes

4. **Run the test suite**:

   ```bash
   npm test
   npm run test:coverage
   ```

5. **Lint your code**:

   ```bash
   npm run lint
   npm run format
   ```

6. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add support for new payment method"
   ```

### Commit Message Guidelines

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `test:` adding or updating tests
- `refactor:` code refactoring
- `style:` code style changes (formatting, etc.)
- `chore:` maintenance tasks

Examples:

```
feat: add support for recurring payments
fix: handle timeout errors in API calls
docs: update P12 certificate setup guide
test: add unit tests for BillTo model
```

## 🧪 Testing Guidelines

### Test Structure

- **Unit tests**: `test/unit/` - Test individual components in isolation
- **Integration tests**: `test/integration/` - Test API interactions
- **Interactive tests**: `test/interactive/` - Manual testing tools

### Writing Tests

1. **Test file naming**: `ComponentName.test.js`
2. **Use descriptive test names**:

   ```javascript
   describe('BillTo Model', () => {
     test('should create instance with all required properties', () => {
       // test implementation
     });
   });
   ```

3. **Test both success and failure cases**
4. **Mock external dependencies** (API calls, file system, etc.)
5. **Aim for high test coverage** (>90%)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Test specific file
npm test -- BillTo.test.js

# Run integration tests only
npm test test/integration/

# Test credentials interactively
npm run test:credentials
```

## 📝 Documentation

### Code Documentation

- **JSDoc comments** for all public methods and classes
- **Type annotations** in JSDoc
- **Usage examples** in JSDoc where helpful
- **Parameter descriptions** and return values

Example:

```javascript
/**
 * Process a direct charge (authorization + capture in one step)
 *
 * @param {ChargeRequest} chargeRequest - The charge request object
 * @param {number} amount - The amount to charge
 * @returns {Promise<Object>} Promise that resolves with charge confirmation
 * @throws {Object} Error object with code, message, and data properties
 * @example
 * const result = await api.chargeCard(chargeRequest, 100.00);
 * console.log('Charge successful:', result.message);
 */
```

### README Updates

When adding new features:

- Update the API reference section
- Add usage examples
- Update the feature list
- Add any new configuration options

## 🎨 Code Style

We use ESLint and Prettier to maintain consistent code style.

### JavaScript Style Guide

- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **ES6+ features** encouraged
- **Descriptive variable names**
- **Small, focused functions**

### Before Submitting

Always run these commands before submitting:

```bash
npm run lint          # Check for linting issues
npm run format        # Format code with Prettier
npm test              # Run all tests
npm run test:coverage # Ensure good test coverage
```

## 🔄 Pull Request Process

### Before Submitting

1. **Sync with upstream**:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Rebase your feature branch** (if needed):

   ```bash
   git checkout feature/your-feature
   git rebase main
   ```

3. **Ensure all checks pass**:
   - [ ] Tests pass (`npm test`)
   - [ ] Linting passes (`npm run lint`)
   - [ ] Code is formatted (`npm run format`)
   - [ ] Documentation is updated
   - [ ] CHANGELOG.md is updated (for significant changes)

### Submitting the PR

1. **Push your branch**:

   ```bash
   git push origin feature/your-feature
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Reference any related issues
   - List the changes made
   - Include testing instructions
   - Add screenshots if UI changes

3. **Respond to feedback** promptly and make requested changes

### PR Review Process

- At least one maintainer will review your PR
- Reviews focus on correctness, security, performance, and maintainability
- Be patient - reviews take time
- Address feedback professionally

## 🆘 Getting Help

- **Documentation**: Check the README and code comments first
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **CyberSource Docs**: [Official CyberSource Documentation](https://developer.cybersource.com/)

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### High Priority

- **Enhanced error handling** and error message improvements
- **Additional payment methods** (e.g., ACH, PayPal)
- **Performance optimizations**
- **Security enhancements**

### Medium Priority

- **More comprehensive examples**
- **Additional test coverage**
- **Documentation improvements**
- **TypeScript migration**

### Good First Issues

Look for issues labeled `good-first-issue` or `beginner-friendly`.

## 📋 Checklist for Contributors

Before submitting your contribution:

- [ ] I have read and understood the contributing guidelines
- [ ] My code follows the project's style guidelines
- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally
- [ ] I have updated documentation as needed
- [ ] My commits follow the conventional commit format
- [ ] I have not included any sensitive information (credentials, keys, etc.)

## 🏆 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to make payment processing easier for the Node.js community! 🎉
