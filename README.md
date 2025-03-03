# User Document Manager

A NestJS application for managing user documents with role-based access control, file storage, and PostgreSQL database.

## Features

- User authentication and authorization
- Role-based access control
- Document management
- File upload and storage (AWS S3)
- Session management
- Health monitoring
- Swagger API documentation

## Prerequisites

- Node.js (v20 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally)
- AWS S3 bucket (for file storage)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/skarthik05/nestjs-user-doc-manager
cd nestjs-user-doc-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Update the `.env` file with your configuration, including AWS credentials.

4. Run with Docker:
```bash
docker-compose up
```

Or run locally:
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

## Database Setup

Generate a migration:
```bash
npm run migration:generate --name <migration-name>
```

Run migrations:
```bash
npm run migration:run
```

Revert last migration:
```bash
npm run migration:revert
```

Seed the database:
```bash
npm run seed
```

## Development

- `npm run start:dev` - Start in development mode
- `npm run build` - Build the application
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run linting
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

## API Documentation

Once the application is running, visit:
- Swagger UI: `http://localhost:3000/doc`


## Security Features

- JWT-based authentication
- Role-based authorization
- Helmet security headers
- Input validation
- Session management

