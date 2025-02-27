# Usa una imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia el package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala las dependencias de producción directamente en el contenedor
RUN npm install --production

# Copia el resto del código de la aplicación al contenedor
COPY . .

# Expone el puerto en el que tu app escucha
EXPOSE 5000

# Configura la variable de entorno PORT
ENV PORT 5000

# Comando para iniciar la aplicación
CMD [ "npm", "start" ]
