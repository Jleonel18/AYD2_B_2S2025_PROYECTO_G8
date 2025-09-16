# Imagen base
FROM node:lts-buster

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json primero (para cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar el resto del código (incluyendo dist y .env si lo quieres dentro del contenedor)
COPY . .

# Compilar el código TypeScript
RUN npm run build

# Exponer el puerto (usa el mismo que en tu .env, ej. 3000)
EXPOSE 3000

# Comando de inicio (ejecuta lo ya compilado)
CMD ["npm", "run", "start-node"]
