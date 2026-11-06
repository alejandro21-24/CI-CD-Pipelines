# Imagen base de Node.js (versión ligera con Alpine)
FROM node:18-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar primero package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Crear la carpeta donde se guardará la base de datos SQLite
RUN mkdir -p /app/data

# Puerto en el que corre el backend
EXPOSE 5000

# Iniciar la aplicación
CMD ["npm", "start"]