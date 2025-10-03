FROM node:22-alpine
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Inyectar VITE_API_URL durante el build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Ejecutar el build de Vite
RUN npm run build

# Instalar serve globalmente
RUN npm install -g serve

# Exponer el puerto 8080
EXPOSE 8080

# Iniciar serve para servir la carpeta dist
CMD ["serve", "-s", "dist", "--listen", "8080"]