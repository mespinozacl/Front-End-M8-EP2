# Utiliza una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instala las dependencias
RUN npm install
# Si usas yarn:
# RUN yarn install

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación React para producción
RUN npm run build
# Si usas yarn:
# RUN yarn build

# Sirve la aplicación construida con un servidor web ligero como serve
RUN npm install -g serve

# Expón el puerto en el que la aplicación será servida (generalmente 3000 para React)
EXPOSE 5173

# Comando para iniciar la aplicación
CMD ["serve", "-s", "build"]