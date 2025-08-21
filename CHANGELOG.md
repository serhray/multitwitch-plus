# Changelog

All notable changes to Multitwitch+ will be documented in this file.

## [1.1.0] - 2025-08-20

### 🔒 Security Improvements
- **BREAKING**: Removed hardcoded JWT secret fallback - JWT_SECRET environment variable now required
- **BREAKING**: Removed client secret from frontend environment variables
- Added comprehensive input validation with express-validator
- Implemented proper CORS configuration with origin whitelist
- Added Helmet.js for security headers and CSP
- Added rate limiting (100 requests per 15 minutes per IP)
- Sanitized error messages in production environment

### 🏗️ Architecture Improvements
- Standardized port configuration to 5001 across all files
- Fixed Node.js version consistency to 20.x
- Added structured logging with Winston
- Implemented global error handling middleware
- Added graceful shutdown handling
- Created centralized environment variable validation

### 📝 Configuration Changes
- Updated .env.example files with security best practices
- Added CLIENT_URL environment variable for dynamic redirects
- Fixed Twitch OAuth redirect URI configuration
- Added comprehensive CORS origins configuration

### 🛠️ Development Experience
- Added concurrently for easier development workflow
- Updated package.json with unified scripts (dev, server, client)
- Added install-deps script for easy setup
- Improved logging in development vs production
- Created logs directory structure

### 📚 Documentation
- Added SECURITY.md with security policies and guidelines
- Updated README.md with correct port information
- Created comprehensive changelog

### 🧹 Code Quality
- Removed excessive logging in production
- Added proper error handling throughout the application
- Implemented validation middleware for all API endpoints
- Added request size limits and security headers

## [1.0.0] - Initial Release

### Features
- Multi-stream viewing with Twitch integration
- Unified chat with translation capabilities
- Audio control and focus management
- Room creation and watch parties
- Real-time communication with Socket.IO
- Modern React frontend with styled-components
- Express.js backend with Twitch API integration
