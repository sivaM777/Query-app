# QueryLinker

## Overview
QueryLinker is a comprehensive knowledge management system built with React, TypeScript, and Cloudflare Workers. It provides functionality for managing integrations, knowledge base articles, SLA configurations, and advanced search capabilities.

## Architecture
- **Frontend**: React 19 with TypeScript, Vite build system, TailwindCSS for styling
- **Backend**: Hono framework running on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) for data persistence
- **Build System**: Vite with Cloudflare plugin for Workers integration

## Recent Changes (Sep 12, 2025)
- Set up project in Replit environment from GitHub import
- Configured Vite dev server to run on port 5000 with proper host settings (0.0.0.0)
- Resolved dependency conflicts with legacy peer deps resolution
- Initialized local D1 database with migrations for development
- Fixed missing react-is dependency for chart components
- Configured deployment settings for autoscale deployment
- **Enhanced SLA Management**: Added comprehensive export functionality with PDF, Excel, CSV, and HTML format support
- **Improved Navigation**: Removed Slack integration from sidebar, streamlined navigation structure
- **Dynamic Workspaces**: Connected workspaces now display actual system integrations dynamically
- **Professional Profile Menu**: Added ITSM-appropriate profile dropdown with account management, security, activity log, and workspace management options
- **Backend Export API**: Implemented `/api/sla-export` endpoint supporting multiple export formats with proper content headers

## Project Structure
- `src/react-app/` - React frontend application
- `src/worker/` - Cloudflare Workers backend (Hono API)
- `src/shared/` - Shared types and utilities
- `migrations/` - Database schema migrations

## Key Features
- Integration management system
- Knowledge base with categories and search
- SLA configuration and management
- Analytics and reporting
- AI-powered search functionality

## Database Schema
The application uses 5 main tables:
- `users` - User management
- `integrations` - System integrations
- `knowledge_base` - Knowledge articles
- `sla_configs` - SLA configurations
- `search_queries` - Search analytics

## Development
- Frontend and backend run together via Vite dev server
- Database initialized with local D1 instance
- All dependencies resolved and working
- Health endpoint: `/api/health`