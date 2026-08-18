FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@latest
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runner
# custom nginx config

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built files into Nginx's default serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

# If using Create React App, change /app/dist to /app/build

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]