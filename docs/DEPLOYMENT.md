# Deployment Guide

This guide provides instructions for deploying the ChatRepo application to various environments including production, staging, and cloud platforms.

## 🚀 Deployment Options

### Local Production Deployment

For local production-like deployment using Docker:

```bash
# Build production images
docker build -t chatrepo:latest .

# Run with production compose
docker compose -f docker-compose.prod.yml up -d
```

### Cloud Platform Deployment

#### Docker-based Deployment

1. **Build and tag images**:
   ```bash
   docker build -t your-registry/chatrepo-api:latest ./cr-api
   docker build -t your-registry/chatrepo-web:latest ./cr-web
   ```

2. **Push to registry**:
   ```bash
   docker push your-registry/chatrepo-api:latest
   docker push your-registry/chatrepo-web:latest
   ```

3. **Deploy using docker-compose**:
   ```yaml
   version: '3.8'
   services:
     api:
       image: your-registry/chatrepo-api:latest
       environment:
         - DATABASE_URL=${DATABASE_URL}
         - REDIS_URL=${REDIS_URL}
         - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
       ports:
         - "3001:3001"
     
     web:
       image: your-registry/chatrepo-web:latest
       ports:
         - "80:80"
   ```

#### Kubernetes Deployment

Example Kubernetes manifests:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatrepo-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chatrepo-api
  template:
    metadata:
      labels:
        app: chatrepo-api
    spec:
      containers:
      - name: api
        image: your-registry/chatrepo-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: chatrepo-secrets
              key: database-url
```

## 🔧 Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```bash
# Application
NODE_ENV=production
PORT=3001

# Database (Production)
DATABASE_URL=postgresql://user:password@prod-db:5432/chatrepo
POSTGRES_USER=chatrepo_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=chatrepo

# Redis (Production)
REDIS_URL=redis://prod-redis:6379

# External APIs
GITHUB_TOKEN=your_production_github_token
ANTHROPIC_API_KEY=your_production_anthropic_key

# Security
CORS_ORIGIN=https://your-domain.com
SESSION_SECRET=your_session_secret

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn
```

### Database Setup

#### PostgreSQL Production Setup

1. **Create production database**:
   ```sql
   CREATE USER chatrepo_user WITH PASSWORD 'secure_password';
   CREATE DATABASE chatrepo OWNER chatrepo_user;
   GRANT ALL PRIVILEGES ON DATABASE chatrepo TO chatrepo_user;
   ```

2. **Run migrations**:
   ```bash
   cd cr-db
   DATABASE_URL=postgresql://... pnpm run migrate
   ```

#### Redis Production Setup

Configure Redis for production with persistence:

```conf
# redis.conf
save 900 1
save 300 10
save 60 10000
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## 🏗️ Infrastructure Setup

### Using Docker Compose

Production `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./cr-api
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=postgresql://chatrepo_user:${POSTGRES_PASSWORD}@db:5432/chatrepo
      - REDIS_URL=redis://cache:6379
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    depends_on:
      - db
      - cache
    restart: unless-stopped
    ports:
      - "3001:3001"

  web:
    build:
      context: ./cr-web
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    restart: unless-stopped

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: chatrepo_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: chatrepo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  cache:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Load Balancing with Nginx

Example Nginx configuration:

```nginx
upstream api_backend {
    server localhost:3001;
    # Add more servers for load balancing
    # server localhost:3002;
    # server localhost:3003;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location / {
        root /var/www/chatrepo;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for chat
    location /api/chat {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring and Observability

### Health Checks

Add health check endpoints:

```typescript
// cr-api/src/routes/health.ts
import { appFactory } from '../factory';

const app = appFactory
  .createApp()
  .get('/health', async (c) => {
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  })
  .get('/ready', async (c) => {
    // Check database connection
    try {
      const db = c.get('db');
      await db.execute(sql`SELECT 1`);
      return c.json({ status: 'ready' });
    } catch (error) {
      return c.json({ status: 'not ready', error: error.message }, 503);
    }
  });

export default app;
```

### Logging Configuration

```typescript
// cr-api/src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

export default logger;
```

### Metrics Collection

Example Prometheus metrics:

```typescript
// cr-api/src/lib/metrics.ts
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

collectDefaultMetrics({ register });

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use HTTPS/TLS certificates
- [ ] Configure CORS properly
- [ ] Set security headers
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

### Security Headers

```typescript
// cr-api/src/middleware/security.ts
import { secureHeaders } from 'hono/secure-headers';

export const securityMiddleware = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
  crossOriginEmbedderPolicy: false,
});
```

## 🚀 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Run tests
      run: pnpm test
    
    - name: Build application
      run: pnpm build
    
    - name: Build Docker images
      run: |
        docker build -t ${{ secrets.REGISTRY }}/chatrepo-api:${{ github.sha }} ./cr-api
        docker build -t ${{ secrets.REGISTRY }}/chatrepo-web:${{ github.sha }} ./cr-web
    
    - name: Push to registry
      run: |
        echo ${{ secrets.REGISTRY_PASSWORD }} | docker login ${{ secrets.REGISTRY }} -u ${{ secrets.REGISTRY_USERNAME }} --password-stdin
        docker push ${{ secrets.REGISTRY }}/chatrepo-api:${{ github.sha }}
        docker push ${{ secrets.REGISTRY }}/chatrepo-web:${{ github.sha }}
    
    - name: Deploy to production
      run: |
        # Deploy using your preferred method
        # kubectl, docker-compose, etc.
```

## 🔄 Backup and Recovery

### Database Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="chatrepo"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h localhost -U chatrepo_user -d $DB_NAME > $BACKUP_DIR/chatrepo_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/chatrepo_$TIMESTAMP.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "chatrepo_*.sql.gz" -mtime +7 -delete
```

### Redis Backup

```bash
# Redis backup script
#!/bin/bash
REDIS_HOST="localhost"
REDIS_PORT="6379"
BACKUP_DIR="/backups/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create Redis dump
redis-cli -h $REDIS_HOST -p $REDIS_PORT --rdb $BACKUP_DIR/dump_$TIMESTAMP.rdb
```

## 📈 Performance Optimization

### Production Optimizations

1. **Enable gzip compression**
2. **Use CDN for static assets**
3. **Implement caching strategies**
4. **Database query optimization**
5. **Connection pooling**
6. **Load balancing**

### Scaling Strategies

#### Horizontal Scaling
- Multiple API instances behind load balancer
- Database read replicas
- Redis clustering
- CDN for static assets

#### Vertical Scaling
- Increase server resources
- Optimize database configuration
- Tune application performance

## 🐛 Troubleshooting

### Common Production Issues

#### Application Won't Start
```bash
# Check logs
docker logs chatrepo-api
docker logs chatrepo-web

# Check environment variables
docker exec chatrepo-api env | grep -E "(DATABASE_URL|REDIS_URL)"
```

#### Database Connection Issues
```bash
# Test database connectivity
docker exec chatrepo-api psql $DATABASE_URL -c "SELECT 1;"

# Check database logs
docker logs chatrepo-db
```

#### High Memory Usage
```bash
# Monitor container resources
docker stats

# Check for memory leaks
docker exec chatrepo-api node --inspect=0.0.0.0:9229 dist/index.js
```

## 📞 Support

For deployment issues:
- Check the troubleshooting section
- Review logs for error messages  
- Consult the architecture documentation
- Create an issue on GitHub with deployment details 