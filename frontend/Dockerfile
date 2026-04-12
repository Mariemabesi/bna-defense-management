# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
# Clean install to avoid host symlink pollution
RUN npm ci
COPY . .
# Angular 17+ with browser-esbuild builder
# Move files if they are in a 'browser' subfolder to ensure consistency
RUN npx ng build --configuration production && \
    if [ -d "dist/bna-defense-frontend/browser" ]; then \
        cp -r dist/bna-defense-frontend/browser/* dist/bna-defense-frontend/; \
    fi

# Run stage
FROM nginx:alpine
# Copy from the normalized directory
COPY --from=build /app/dist/bna-defense-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
