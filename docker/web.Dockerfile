# Build stage
FROM node:16-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY src/ERP.Web/package*.json ./
RUN npm ci

# Copy source code and build
COPY src/ERP.Web/ ./
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
