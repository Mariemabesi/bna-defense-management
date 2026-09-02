# Run stage
FROM nginx:alpine
# Copy from the local build directory
COPY dist/bna-defense-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
