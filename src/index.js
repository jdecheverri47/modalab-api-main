// server.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import pino from "pino";
import { handleStripeWebhook } from "./routes/stripe-webhooks.js";

// Importaciones de tus typedefs y resolvers
import typeDefs from "./graphql/typedefs/index.js";
import resolvers from "./graphql/resolvers/index.js";

// Importaciones de tus DataSources
import UserAPI from "./graphql/datasources/userDataSource.js";
import DesignerAPI from "./graphql/datasources/designerDataSource.js";
import CompanyAPI from "./graphql/datasources/companyDataSource.js";
import RetailersDetailsAPI from "./graphql/datasources/retailersDetailsDataSource.js";
import AddressesAPI from "./graphql/datasources/addressesDataSource.js";
import BrandAPI from "./graphql/datasources/brandDetailsDataSource.js";
import CollectionsAPI from "./graphql/datasources/collectionsDataSource.js";
import CategoriesAPI from "./graphql/datasources/categoriesDataSource.js";
import ProductAPI from "./graphql/datasources/productDataSource.js";
import VerticalsAPI from "./graphql/datasources/verticalDataSource.js";
import SubcategoriesAPI from "./graphql/datasources/subcategoriesDataSource.js";
import CartAPI from "./graphql/datasources/cartDataSource.js";
import FavoritesAPI from "./graphql/datasources/favoritesDataSource.js";
import FollowAPI from "./graphql/datasources/followDataSource.js";
import OrdersAPI from "./graphql/datasources/ordersDataSource.js";
import OrderDetailAPI from "./graphql/datasources/orderDetailsDataSource.js";
import ConnectionsAPI from "./graphql/datasources/connectionsDataSource.js";

import sequelize from "./config/database.js";
import * as models from "./models/index.js";

import importRouter from "./routes/import.js";

// Determina si estamos en producción
const isProduction = process.env.NODE_ENV === "production";

// Cargar variables de entorno desde .env si no estamos en producción
if (!isProduction) {
  dotenv.config();
}

// Crear instancia de Express
const app = express();

// Configurar logger con Pino
const logger = pino({ level: isProduction ? "info" : "debug" });

// Configurar CORS
const allowedOrigins = [
  "https://www.modalab.co",
  "https://modalab.co",
  "http://localhost:3000",
  "http://localhost:8080",
  "https://studio.apollographql.com",
  // Agrega aquí otros orígenes necesarios
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // Solicitudes como Postman no envían el origen
      return callback(null, true);
    }
    if (!isProduction) {
      // Permitir todos los orígenes en desarrollo
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    logger.error(`Origen no permitido por CORS: ${origin}`);
    return callback(new Error("No permitido por CORS"));
  },
  credentials: true, // Permite cookies y credenciales
  allowedHeaders: ["Authorization", "Content-Type"], // Permitir cabeceras personalizadas
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos permitidos
};

// Aplica los middlewares antes de inicializar Apollo Server
app.use(cors(corsOptions));
if (isProduction) {
  app.use(helmet());
}
app.use(compression());

app.post(
  "/api/stripe-webhook-handler",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());

// Rutas adicionales
app.use("/api", importRouter);

// Configura Apollo Server con contexto para autenticación
const server = new ApolloServer({
  debug: !isProduction, // Deshabilitar debug en producción
  introspection: !isProduction, // Deshabilitar introspección en producción
  typeDefs,
  resolvers,
  dataSources: () => ({
    userAPI: new UserAPI({ models }),
    designerAPI: new DesignerAPI({ models }),
    companyAPI: new CompanyAPI({ models }),
    retailersDetailsAPI: new RetailersDetailsAPI({ sequelize }),
    addressesAPI: new AddressesAPI({ models }),
    brandAPI: new BrandAPI({ sequelize }),
    productAPI: new ProductAPI({ sequelize }),
    collectionsAPI: new CollectionsAPI({ sequelize }),
    categoriesAPI: new CategoriesAPI({ sequelize }),
    verticalsAPI: new VerticalsAPI({ sequelize }),
    subcategoriesAPI: new SubcategoriesAPI({ sequelize }),
    cartAPI: new CartAPI({ models }),
    favoritesAPI: new FavoritesAPI({ models }),
    followAPI: new FollowAPI({ models }),
    ordersAPI: new OrdersAPI({ models }),
    orderDetailAPI: new OrderDetailAPI({ models }),
    connectionsAPI: new ConnectionsAPI({ models }),
  }),
  context: async ({ req }) => {
    // Obtener el token de las cabeceras de autorización
    const token = req.headers.authorization || "";
    const user = null;

    if (token) {
      try {
        const decodedToken = jwt.verify(
          token.replace("Bearer ", ""),
          process.env.JWT_SECRET
        );
        // Retorna el token decodificado directamente
        return { user: decodedToken, models };
      } catch (err) {
        throw new AuthenticationError("Token inválido o expirado");
      }
    }

    return { user, models };
  },
});

// Ruta para health checks
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Función para inicializar y aplicar Apollo Server
const startServer = async () => {
  try {
    // Inicia Apollo Server
    await server.start();
    logger.info("Apollo Server iniciado correctamente.");

    // Vincula Apollo con Express
    server.applyMiddleware({ app }); // No deshabilitamos CORS aquí
    logger.info("Apollo Server vinculado con Express.");

    // Conexión a la base de datos
    await sequelize.authenticate();
    logger.info("Conexión a la base de datos establecida correctamente.");

    if (!isProduction) {
      // Sincroniza los modelos con la base de datos en desarrollo
      await sequelize.sync({ alter: true });
      logger.info("Base de datos sincronizada correctamente.");
    } else {
      // En producción, deberías manejar migraciones en lugar de sync
      logger.info("Entorno de producción detectado. Omitiendo sincronización.");
    }

    // Iniciar el servidor en el puerto especificado
    const PORT = process.env.PORT || 8080; // Cloud Run utiliza el puerto 8080 por defecto
    app.listen(PORT, () => {
      logger.info(
        `🚀 Servidor ejecutándose en el puerto ${PORT}${server.graphqlPath}`
      );
    });
  } catch (error) {
    logger.error(`Error al iniciar el servidor: ${error.message}`, { error });
  }
};

// Llamar a la función para inicializar el servidor
startServer();
