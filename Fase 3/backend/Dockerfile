# Etapa 1: build
FROM node:lts-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # genera dist/

# Etapa 2: runtime
FROM node:lts-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev   # instala solo dependencias de prod
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "run", "start-node"]
