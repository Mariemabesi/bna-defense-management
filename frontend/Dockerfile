# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
# Clean install to avoid host symlink pollution
RUN npm ci
COPY . .
# Angular 17+ with browser-esbuild builder
# Move files if they are in a 'browser' subfolder to ensure consistency
RUN npm run build -- --configuration production

# Run stage
FROM nginx:alpine
# In Angular 17, artifacts are created in dist/[name]/browser
COPY --from=build /app/dist/bna-defense-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
