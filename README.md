> [!CAUTION]
> This project is under development and not ready for production use.

# Chat With GitHub Trend

Chat with the latest trending GitHub repositories through a simple chat interface.

## Overview

WIP demo picture

## Deploy

### Step 1

Ensure a `.env` file is present in the root of the project.

```bash
cp .env.example .env
```

### Step 2

```bash
docker compose up -d
```

## Architecture

![](./docs/images/architecture.png)

### File Structure

| Package            | Description                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------- |
| @chatrepo/api      | Backend API service built with Hono, handling GitHub repository data and chat functionality |
| @chatrepo/web      | Frontend web application built with React(Next.js), handling the chat interface             |
| @chatrepo/db       | Database schema and migrations                                                              |
| @chatrepo/tsconfig | TypeScript configuration for the project                                                    |

## Credit

- [uithub](https://uithub.com)

## License

MIT
