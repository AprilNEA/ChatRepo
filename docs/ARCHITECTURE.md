# Architecture Overview

ChatRepo is a sophisticated application that enables developers to have intelligent conversations with trending GitHub repositories through AI assistance. This document provides a detailed overview of the system architecture, components, and design decisions.

## 🏗️ System Architecture

The application follows a modern microservices architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (cr-web)      │◄──►│   (cr-api)      │◄──►│   (cr-db)       │
│   React/Vite    │    │   Hono/Node.js  │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Queue System  │    │   Cache Layer   │
                       │   BullMQ        │◄──►│   Redis         │
                       └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   GitHub API    │    │   AI Provider   │
                       │   Integration   │    │   Anthropic     │
                       └─────────────────┘    └─────────────────┘
```

## 📦 Package Structure

The project is organized as a monorepo with the following packages:

### @chatrepo/api (cr-api)
**Purpose**: Backend API service providing REST endpoints and real-time chat functionality

**Technology Stack**:
- **Framework**: Hono (lightweight, fast web framework)
- **Runtime**: Node.js with TypeScript
- **Queue System**: BullMQ for background job processing
- **AI Integration**: Anthropic Claude for chat responses
- **GitHub Integration**: Octokit for repository data fetching

**Key Components**:
- `/routes/chat.ts` - AI chat endpoint with streaming responses
- `/routes/repo.ts` - Repository management endpoints
- `/routes/config.ts` - Configuration endpoints
- `/queues/` - Background job processors for GitHub trending tracking
- `/lib/github.ts` - GitHub API integration utilities

### @chatrepo/web (cr-web)
**Purpose**: Frontend web application providing the user interface

**Technology Stack**:
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: SWR for data fetching and caching
- **Styling**: Tailwind CSS for utility-first styling

**Key Components**:
- `App.tsx` - Main application component with chat interface
- `/components/ui/chat/` - Chat-specific UI components
- `/components/trend-list.tsx` - GitHub trending repositories list
- `/hooks/use-repo.tsx` - Repository state management
- `/lib/api-client.ts` - Type-safe API client

### @chatrepo/db (cr-db)
**Purpose**: Database schema, migrations, and type definitions

**Technology Stack**:
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL for reliable data storage
- **Migration System**: Drizzle Kit for schema migrations

**Schema Design**:
```sql
-- Core repository information
repos {
  id: primary key
  name: varchar
  owner: varchar
  full_name: varchar (unique)
  description: text
  stars: integer
  url: varchar
  language: varchar
  avatar_url: varchar
  created_at: timestamp
  updated_at: timestamp
}

-- Repository context for AI processing
repo_context {
  id: primary key
  repo_id: foreign key -> repos.id
  format: varchar (default: 'text/plain')
  branch: varchar (default: 'main')
  content: text
  job_id: varchar
  other: jsonb
  created_at: timestamp
  updated_at: timestamp
}
```

### @chatrepo/tsconfig (cr-tsconfig)
**Purpose**: Shared TypeScript configuration across all packages

**Configurations**:
- `base.json` - Base TypeScript configuration
- `node-library.json` - Node.js library specific configuration

## 🔄 Data Flow

### 1. Repository Discovery & Processing
```
GitHub Trending API → BullMQ Queue → Repository Processor → Database Storage
                                  ↓
                            Content Analyzer → AI Processing → Context Storage
```

### 2. Chat Interaction Flow
```
User Message → Frontend → API Endpoint → AI Provider → Streaming Response → Frontend
                     ↓
              Repository Context Retrieval ← Database Query
```

### 3. Scheduled Operations
```
Cron Schedule (Daily) → BullMQ Scheduler → Trend Tracker → GitHub API → Database Update
```

## 🚀 Background Job System

The application uses BullMQ for robust background job processing:

### Job Types

1. **Trend Tracker** (`trend-tracker.ts`)
   - **Schedule**: Daily at midnight (cron: `0 0 * * *`)
   - **Purpose**: Fetches latest GitHub trending repositories
   - **Process**: API call → data normalization → database upsert

2. **Content Converter** (`converter.ts`)
   - **Trigger**: When new repositories are added
   - **Purpose**: Processes repository content for AI consumption
   - **Process**: Repository cloning → content extraction → context generation

### Queue Configuration
- **Concurrency**: Configurable worker concurrency
- **Retry Logic**: Exponential backoff for failed jobs
- **Monitoring**: Job status tracking and error handling

## 🔌 External Integrations

### GitHub API Integration
- **Authentication**: Optional GitHub token for higher rate limits
- **Endpoints Used**:
  - Repository information and metadata
  - Repository contents and file structure
  - Programming language statistics
  - Repository topics and licenses

### AI Provider Integration
- **Provider**: Anthropic Claude 3.5 Sonnet
- **Features**:
  - Streaming text generation
  - Context-aware responses
  - Repository-specific knowledge injection

## 🏪 Infrastructure

### Development Environment
```yaml
# docker-compose.yml
services:
  db:        # PostgreSQL database
  cache:     # Redis for queue management
```

### Database Design Principles
- **Normalization**: Separated concerns between repositories and their processed content
- **Indexing**: Optimized queries with unique indexes on repository identifiers
- **Extensibility**: JSONB fields for flexible metadata storage

### Caching Strategy
- **Redis**: Used by BullMQ for job queues and temporary data
- **SWR**: Client-side caching for API responses
- **Database**: Efficient queries with proper indexing

## 🔐 Security Considerations

### API Security
- Input validation using Zod schemas
- Rate limiting considerations for AI API calls
- Environment-based configuration management

### Data Protection
- No sensitive user data storage
- GitHub token security best practices
- Secure database connections

## 📈 Scalability Design

### Horizontal Scaling
- Stateless API design enables multiple instance deployment
- Queue-based architecture supports distributed processing
- Database connection pooling for efficient resource usage

### Performance Optimizations
- Streaming responses for real-time chat experience
- Background processing for heavy operations
- Efficient database queries with proper indexing

## 🔧 Configuration Management

### Environment Variables
```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
DATABASE_URL=postgresql://...

# External APIs
GITHUB_TOKEN=optional_github_token
ANTHROPIC_API_KEY=required_api_key

# Application
PORT=3001
NODE_ENV=development|production
```

### Build Configuration
- TypeScript strict mode enabled
- ESLint and Prettier for code quality
- Vite for optimized frontend builds

This architecture provides a solid foundation for a scalable, maintainable application that can efficiently process GitHub repository data and provide intelligent chat interactions. 