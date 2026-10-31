# build: Next.js static export -> /app/out
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g npm@12 && npm ci
COPY . .
RUN npm run build

# serve: plain nginx, no Node at runtime
FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
