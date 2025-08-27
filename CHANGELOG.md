# Changelog

All notable changes to Multitwitch+ will be documented in this file.

## [1.2.0] - 2025-01-XX

### 🌐 Multi-Platform Support
- **NEW**: Added support for Kick streaming platform
- **NEW**: Unified search across Twitch and Kick platforms
- **NEW**: Automatic platform detection based on streamer name/URL
- **NEW**: Platform badges for visual identification (green for Kick, purple for Twitch)
- **NEW**: Unified stream player that supports both platforms

### 🔍 Enhanced Search Experience
- **NEW**: UnifiedStreamSearch component with platform selection
- **NEW**: Automatic platform detection from URLs (kick.com/streamer, twitch.tv/streamer)
- **NEW**: Manual platform selection option
- **NEW**: Combined search results from both platforms
- **NEW**: Real-time search with debouncing

### 📺 Improved Player Experience
- **NEW**: UnifiedStreamPlayer component supporting both Twitch and Kick
- **NEW**: Platform-specific player embeds (Twitch Embed API and Kick iframe)
- **NEW**: Stream information overlay with title and game
- **NEW**: Visual platform identification with colored badges

### 💬 Chat Integration
- **NOTE**: Chat system uses Twitch as primary platform
- **NOTE**: Kick streams work without chat integration
- **NOTE**: Chat functionality limited to Twitch streams only

### 🔧 Backend Enhancements
- **NEW**: Kick API integration with comprehensive endpoints
- **NEW**: Unified streamer service for both platforms
- **NEW**: Platform detection and channel name cleaning utilities
- **NEW**: Error handling for platform-specific API failures

### 🎨 UI/UX Improvements
- **NEW**: Platform-specific color schemes (green for Kick, purple for Twitch)
- **NEW**: Enhanced search interface with platform toggles
- **NEW**: Improved stream information display
- **NEW**: Better visual feedback for platform selection

### 📚 Documentation
- **NEW**: KICK_SUPPORT.md with comprehensive Kick integration guide
- **UPDATED**: README.md with multi-platform features
- **UPDATED**: API documentation for Kick endpoints

### 🛠️ Technical Improvements
- **NEW**: Unified service architecture for multi-platform support
- **NEW**: Platform detection algorithms
- **NEW**: Fallback mechanisms for API failures
- **IMPROVED**: Error handling for cross-platform scenarios

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
