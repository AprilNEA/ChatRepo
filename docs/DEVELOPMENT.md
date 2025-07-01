# Development Guide

This guide provides comprehensive instructions for setting up, developing, and contributing to the ChatRepo project.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (recommended package manager)
- **Docker**: For running local infrastructure
- **Git**: For version control

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AprilNEA/ChatRepo.git
   cd ChatRepo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```

4. **Start infrastructure services**
   ```bash
   docker compose up -d
   ```

5. **Initialize database**
   ```bash
   pnpm run db:push
   ```

6. **Start development servers**
   ```bash
   pnpm run dev
   ```

This will start:
- API server at `http://localhost:3001`
- Web application at `http://localhost:5173`

## 🏗️ Project Structure

```
ChatRepo/
├── cr-api/                 # Backend API service
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── lib/            # Utility libraries
│   │   ├── queues/         # Background job processors
│   │   ├── db/             # Database connections
│   │   └── index.ts        # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── cr-web/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main application component
│   ├── package.json
│   └── vite.config.ts
├── cr-db/                  # Database schema and migrations
│   ├── src/schema/         # Database schema definitions
│   ├── migrations/         # Database migration files
│   └── drizzle.config.ts   # Drizzle ORM configuration
├── cr-tsconfig/            # Shared TypeScript configurations
├── docs/                   # Documentation
├── docker-compose.yml      # Local development infrastructure
└── package.json            # Root workspace configuration
```

## 🛠️ Development Workflow

### Working with the Monorepo

This project uses pnpm workspaces for efficient dependency management:

```bash
# Install dependencies for all packages
pnpm install

# Install a dependency in a specific package
pnpm add <package> --filter @chatrepo/api

# Run scripts in specific packages
pnpm --filter @chatrepo/web run dev
pnpm --filter @chatrepo/api run build
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# Redis Configuration
REDIS_URL=redis://localhost:6379

# GitHub API (Optional - for higher rate limits)
GITHUB_TOKEN=your_github_token_here

# AI Provider
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Application Configuration
PORT=3001
NODE_ENV=development
```

### Database Development

#### Schema Changes

1. **Modify schema files** in `cr-db/src/schema/`
2. **Generate migration**:
   ```bash
   cd cr-db
   pnpm run generate
   ```
3. **Apply migration**:
   ```bash
   pnpm run push
   ```

#### Working with Drizzle ORM

```typescript
// Example: Adding a new table
import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const newTable = pgTable('new_table', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### API Development

#### Adding New Routes

1. **Create route file** in `cr-api/src/routes/`
2. **Define route handlers**:
   ```typescript
   import { appFactory } from '../factory';
   import { zValidator } from '@hono/zod-validator';
   import { z } from 'zod';

   const app = appFactory
     .createApp()
     .get('/', async (c) => {
       return c.json({ message: 'Hello World' });
     })
     .post('/', 
       zValidator('json', z.object({
         name: z.string(),
       })),
       async (c) => {
         const { name } = c.req.valid('json');
         return c.json({ message: `Hello ${name}` });
       }
     );

   export default app;
   ```

3. **Register route** in `cr-api/src/index.ts`:
   ```typescript
   import newRoute from './routes/new-route';
   
   export const routes = new Hono()
     .route('/new', newRoute)
     // ... existing routes
   ```

#### Background Jobs

Creating new background jobs:

```typescript
// cr-api/src/queues/new-job.ts
import { Queue, Worker } from 'bullmq';
import redisConnection from '../db/redis';

export const queue = new Queue('new-job', {
  connection: redisConnection,
});

export const worker = new Worker('new-job', async (job) => {
  const { data } = job;
  
  // Process job
  console.log('Processing job:', data);
  
  return { success: true };
}, {
  connection: redisConnection,
});
```

### Frontend Development

#### Component Development

Follow these conventions:

```typescript
// components/ui/new-component.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NewComponentProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary';
}

export function NewComponent({ 
  children, 
  className, 
  variant = 'default' 
}: NewComponentProps) {
  return (
    <div className={cn(
      'base-classes',
      variant === 'default' && 'default-variant-classes',
      variant === 'secondary' && 'secondary-variant-classes',
      className
    )}>
      {children}
    </div>
  );
}
```

#### State Management

Use SWR for server state and useState/useReducer for local state:

```typescript
// hooks/use-custom-data.tsx
import useSWR from 'swr';
import { useHC } from '@/lib/hono-swr';
import apiClient from '@/lib/api-client';

export function useCustomData() {
  const { data, error, isLoading, mutate } = useHC(
    apiClient.custom.endpoint.$get,
    {}
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}
```

## 🧪 Testing

### Unit Testing

```bash
# Run tests for all packages
pnpm test

# Run tests for specific package
pnpm --filter @chatrepo/api test

# Run tests in watch mode
pnpm test --watch
```

### Integration Testing

```bash
# Start test database
docker compose -f docker-compose.test.yml up -d

# Run integration tests
pnpm test:integration
```

### Writing Tests

#### API Tests
```typescript
// cr-api/tests/routes/repo.test.ts
import { describe, it, expect } from 'vitest';
import { testClient } from 'hono/testing';
import app from '../../src/routes/repo';

describe('Repository Routes', () => {
  it('should return repositories list', async () => {
    const res = await testClient(app).repo.$get();
    expect(res.status).toBe(200);
  });
});
```

#### Component Tests
```typescript
// cr-web/tests/components/NewComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NewComponent } from '../src/components/NewComponent';

describe('NewComponent', () => {
  it('renders children correctly', () => {
    render(<NewComponent>Test content</NewComponent>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
```

## 📦 Building and Deployment

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @chatrepo/web build
```

### Docker Deployment

```dockerfile
# Example Dockerfile for API
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3001

# Start application
CMD ["pnpm", "start"]
```

### Environment-specific Configurations

#### Development
- Hot reload enabled
- Detailed error messages
- Debug logging

#### Production
- Optimized builds
- Error monitoring
- Performance monitoring
- Security headers

## 🔧 Tools and Configuration

### TypeScript Configuration

Base configuration in `cr-tsconfig/base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Code Quality Tools

#### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### VS Code Configuration

Recommended extensions:
- TypeScript and JavaScript Language Features
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Auto Rename Tag

Settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 🤝 Contributing

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** following the coding standards
4. **Write tests** for new functionality
5. **Run the test suite**:
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```
6. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Create a Pull Request**

### Commit Message Convention

Follow the Conventional Commits specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Review Guidelines

- Ensure all tests pass
- Follow existing code patterns
- Add documentation for new features
- Keep PRs focused and reasonably sized
- Respond to feedback promptly

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Reset database
docker compose down -v
docker compose up -d
pnpm run db:push
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :3001
lsof -i :5173

# Kill processes if needed
kill -9 <PID>
```

#### Module Resolution Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Performance Debugging

#### API Performance
```typescript
// Add timing middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  c.res.headers.set('X-Response-Time', `${ms}ms`);
});
```

#### Frontend Performance
```typescript
// Use React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Render:', { id, phase, actualDuration });
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

## 📚 Additional Resources

- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [BullMQ Documentation](https://docs.bullmq.io/)

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and community support
- **Documentation**: Check the docs/ directory for detailed guides
- **Code Examples**: See tests/ directories for usage examples 