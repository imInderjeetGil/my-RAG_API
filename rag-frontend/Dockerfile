# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# If using React Router, copy a custom nginx config to handle fallbacks
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]