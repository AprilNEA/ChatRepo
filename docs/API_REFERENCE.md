# API Reference

This document provides a comprehensive reference for the ChatRepo API endpoints, including request/response formats, authentication, and usage examples.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API does not require authentication for basic operations. However, the GitHub integration uses optional token-based authentication for higher rate limits.

## Content Type

All API endpoints expect and return JSON data with `Content-Type: application/json` unless otherwise specified.

## Endpoints

### Repository Management

#### GET /repo

Retrieve all repositories in the database.

**Request:**
```http
GET /api/repo
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "react",
    "owner": "facebook",
    "fullName": "facebook/react",
    "description": "The library for web and native user interfaces.",
    "stars": 230000,
    "url": "https://github.com/facebook/react",
    "language": "JavaScript",
    "avatarUrl": "https://avatars.githubusercontent.com/u/69631?v=4",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

**Response Schema:**
```typescript
interface Repository {
  id: number;
  name: string;
  owner: string;
  fullName: string;
  description: string | null;
  stars: number;
  url: string;
  language: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}
```

---

#### GET /repo/list

Retrieve the top 10 most recent and popular repositories with their context data.

**Request:**
```http
GET /api/repo/list
```

**Query Parameters:**
None

**Response:**
```json
[
  {
    "id": 1,
    "name": "react",
    "owner": "facebook",
    "fullName": "facebook/react",
    "description": "The library for web and native user interfaces.",
    "stars": 230000,
    "url": "https://github.com/facebook/react",
    "language": "JavaScript",
    "avatarUrl": "https://avatars.githubusercontent.com/u/69631?v=4",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "repoContext": [
      {
        "id": 1,
        "repoId": 1,
        "format": "text/plain",
        "branch": "main",
        "content": "Repository analysis and content...",
        "jobId": "job_12345",
        "other": {},
        "createdAt": "2024-01-15T10:35:00Z",
        "updatedAt": null
      }
    ]
  }
]
```

**Response Schema:**
```typescript
interface RepositoryWithContext extends Repository {
  repoContext: RepoContext[];
}

interface RepoContext {
  id: number;
  repoId: number;
  format: string;
  branch: string;
  content: string | null;
  jobId: string | null;
  other: Record<string, any> | null;
  createdAt: string;
  updatedAt: string | null;
}
```

---

#### GET /repo/with-context

Retrieve all repositories with their associated context data.

**Request:**
```http
GET /api/repo/with-context
```

**Response:**
Same as `/repo/list` but returns all repositories instead of limiting to 10.

---

#### POST /repo/trigger-import

Manually trigger the GitHub trending repository import process.

**Request:**
```http
POST /api/repo/trigger-import
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Trend import job queued successfully",
  "jobId": "12345"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Failed to queue trend import job",
  "error": "Rate limit exceeded"
}
```

**Response Schema:**
```typescript
interface TriggerImportResponse {
  success: boolean;
  message: string;
  jobId?: string;
  error?: string;
}
```

### Chat Interface

#### POST /chat

Start or continue a chat conversation about repositories using AI assistance.

**Request:**
```http
POST /api/chat
Content-Type: application/json
```

**Request Body:**
```json
{
  "messages": [
    {
      "id": "1",
      "role": "user",
      "content": "Can you explain the architecture of this React repository?"
    }
  ]
}
```

**Request Schema:**
```typescript
interface ChatRequest {
  messages: Message[];
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}
```

**Response:**
This endpoint returns a streaming response using the Vercel AI SDK data stream format.

**Headers:**
```
X-Vercel-AI-Data-Stream: v1
Content-Type: text/plain; charset=utf-8
```

**Response Body:**
The response is a text stream containing AI-generated responses. The stream includes:
- Text chunks as they are generated
- Metadata about the generation process
- End-of-stream markers

**Example Stream Data:**
```
0:"The React repository is organized into several key directories:\n\n"
0:"1. **packages/**: Contains the core React packages including:\n"
0:"   - `react`: Core React library\n"
0:"   - `react-dom`: DOM-specific methods\n"
0:"   - `scheduler`: Cooperative scheduling\n\n"
0:"2. **scripts/**: Build and development scripts\n"
...
d:{"finishReason":"stop","usage":{"promptTokens":1234,"completionTokens":567}}
```

### Configuration

#### GET /config

Retrieve application configuration and status information.

**Request:**
```http
GET /api/config
```

**Response:**
```json
{
  "version": "1.0.0",
  "environment": "development",
  "features": {
    "githubIntegration": true,
    "aiChat": true,
    "backgroundJobs": true
  }
}
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format or parameters |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `REPOSITORY_NOT_FOUND` | Requested repository does not exist |
| `INVALID_REQUEST` | Request validation failed |
| `GITHUB_API_ERROR` | GitHub API integration error |
| `AI_SERVICE_ERROR` | AI provider service error |
| `QUEUE_ERROR` | Background job queue error |

## Rate Limiting

### Current Limits
- No explicit rate limiting is currently implemented
- Limits may be imposed by external services (GitHub API, AI provider)

### Best Practices
- Implement client-side debouncing for chat inputs
- Cache responses when appropriate
- Monitor API usage patterns

## SDK Usage Examples

### Using the API Client (TypeScript)

```typescript
import apiClient from './lib/api-client';

// Fetch repositories
const repositories = await apiClient.repo.list.$get();

// Trigger manual import
const importResult = await apiClient.repo['trigger-import'].$post({});

// Start chat (note: streaming response requires special handling)
const chatResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'Tell me about this repository'
      }
    ]
  })
});
```

### Using SWR for Data Fetching

```typescript
import useSWR from 'swr';
import { useHC } from './lib/hono-swr';
import apiClient from './lib/api-client';

function RepositoryList() {
  const { data, error, isLoading } = useHC(apiClient.repo.list.$get, {});
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data?.map(repo => (
        <li key={repo.id}>{repo.fullName}</li>
      ))}
    </ul>
  );
}
```

## Webhooks and Real-time Updates

Currently, the API does not support webhooks or real-time updates beyond the chat streaming interface. Future versions may include:

- WebSocket connections for real-time repository updates
- Webhook endpoints for external integrations
- Server-sent events for background job status

## OpenAPI Specification

The API follows OpenAPI 3.0 standards. A full OpenAPI specification file can be generated from the Hono route definitions for use with tools like Swagger UI or Postman.

## Support and Versioning

### API Versioning
- Current version: v1 (implicit)
- Breaking changes will be introduced in new API versions
- Backward compatibility will be maintained for at least one major version

### Support
- API documentation updates with each release
- Issue tracking via GitHub repository
- Community support through discussions and issues 