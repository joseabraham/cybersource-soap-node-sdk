# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite with Jest
- Interactive credential testing tool
- Extensive JSDoc documentation for all methods
- ESLint and Prettier configuration for code quality
- P12 certificate authentication support
- TypeScript definitions
- Detailed README with usage examples
- Contributing guidelines
- GitHub Actions workflow (planned)

### Changed
- Fixed typo: "enviroment" → "environment" throughout codebase
- Improved error handling and response formatting
- Updated package.json with proper npm scripts and metadata
- Enhanced code structure and organization

### Fixed
- Fixed syntax error in Card.js model
- Removed obsolete commented code
- Standardized naming conventions

### Security
- Added .gitignore and .npmignore to prevent credential exposure
- Enhanced certificate handling for P12 authentication

## [1.0.9] - Previous Release

### Features
- Basic SOAP API integration with CyberSource
- Support for authorization, capture, and direct charge operations
- Subscription/tokenization functionality
- Username/password authentication
- Multi-language error messages (English/Spanish)

---

## Release Notes

### How to Update

1. **From 1.0.x**: This is a major refactor with breaking changes in some areas. Please review the new documentation and test thoroughly.

2. **New installations**: Simply install with `npm install cybersource-soap-node-sdk`

### Migration Guide

If upgrading from a previous version:

1. **Environment parameter**: Change `enviroment` to `environment` in your constructor calls
2. **Testing**: Use the new interactive testing tools to validate your integration
3. **Error handling**: Review error response format changes
4. **Documentation**: Check the updated README for new features and examples

### Support

For issues or questions about this release:
- Review the [README.md](README.md) for updated documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub for bugs or feature requests