# Docker Setup for Educational Hub

This project includes Docker configuration for easy deployment and development.

## Prerequisites

- Docker
- Docker Compose (optional, for multi-service setup)

## Quick Start

### Building the Docker Image

```bash
docker build -t educational-hub .
```

### Running the Container

```bash
docker run -p 3000:3000 educational-hub
```

The application will be available at `http://localhost:3000`

## Using Docker Compose

### Development with Docker Compose

```bash
# Build and start the services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop the services
docker-compose down
```

## Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.production.example .env.production
   ```

2. Update the values in `.env.production` with your actual configuration

3. Uncomment the `env_file` section in `docker-compose.yml` to use the environment file

## Production Deployment

### Building for Production

```bash
# Build the production image
docker build -t educational-hub:production .

# Run the production container
docker run -d \
  --name educational-hub-prod \
  -p 3000:3000 \
  --env-file .env.production \
  educational-hub:production
```

### With External Services

If you're using external MongoDB and Redis services, update your environment variables accordingly and run:

```bash
docker run -d \
  --name educational-hub-prod \
  -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_connection_string" \
  -e REDIS_URL="your_redis_connection_string" \
  educational-hub:production
```

## Docker Image Details

- **Base Image**: `node:20.19.1-alpine`
- **Build Strategy**: Multi-stage build for optimized production image
- **Output**: Standalone Next.js application
- **Port**: 3000
- **User**: Non-root user (nextjs) for security

## Troubleshooting

### Build Issues

If you encounter build issues, try:

```bash
# Clean build (no cache)
docker build --no-cache -t educational-hub .

# Check build logs
docker build -t educational-hub . 2>&1 | tee build.log
```

### Runtime Issues

```bash
# Check container logs
docker logs educational-hub

# Interactive shell access
docker exec -it educational-hub sh
```

### Memory Issues

If the build process runs out of memory, you can increase Docker's memory allocation or use build arguments:

```bash
docker build --memory=4g -t educational-hub .
```

## Notes

- The Dockerfile uses `npm install --force` as specified
- The application runs on Node.js 20.19.1 Alpine for minimal image size
- Standalone output is enabled for optimal Docker performance
- Non-root user is used for security best practices
