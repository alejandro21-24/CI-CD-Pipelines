# ---------- Etapa 1: build de la aplicación React (Vite) ----------
FROM node:18-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Vite lee las variables VITE_* en tiempo de build, por eso se recibe como argumento
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Generar el build de producción (queda en /app/dist)
RUN npm run build

# ---------- Etapa 2: servir los archivos con nginx ----------
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

# Puerto por defecto de nginx
EXPOSE 80

# Iniciar nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]