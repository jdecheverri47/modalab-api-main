import { AuthenticationError, UserInputError } from "apollo-server";

const connectionsResolvers = {
  Query: {
    getConnection: async (_, { id }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in.");
      }

      const connection = await dataSources.connectionsAPI.getConnectionById(id);
      if (!connection) {
        throw new UserInputError("Connection not found.");
      }

      // (Opcional) Valida que el usuario tenga permiso de ver la conexión
      // if (connection.requesterId !== user.id && connection.receiverId !== user.id && !user.isAdmin) {
      //   throw new AuthenticationError("Not authorized to see this connection.");
      // }

      return connection;
    },

    getConnections: async (_, __, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in.");
      }
      // (Opcional) Requerir rol de admin
      // if (user.role !== 'ADMIN') { ... }

      return dataSources.connectionsAPI.getAllConnections();
    },

    getRepBrands: async (_, __, { dataSources, user }) => {
      if (!user || user.role !== "rep") {
        throw new AuthenticationError("You must be logged in.");
      }

      const connections = await dataSources.connectionsAPI.getConnectionsByType(
        user.id,
        "BRAND_REP"
      );

      return connections;
    },

    availableReps: async (_, __, { dataSources, user }) => {
      if (!user) {
        throw new Error("Unauthorized");
      }

      const connections = await dataSources.connectionsAPI.getConnections(
        user.id
      );

      console.log("connections", connections);

      const connectedRepIds = new Set(
        connections.flatMap((connection) =>
          connection.requesterId === user.id
            ? connection.receiverId
            : connection.requesterId
        )
      );

      console.log("connectedRepIds", connectedRepIds);

      const availableReps = await dataSources.userAPI.getAvailableReps(
        Array.from(connectedRepIds)
      );

      return availableReps.map((rep) => ({
        user: {
          id: rep.dataValues.id,
          name: rep.dataValues.name,
          email: rep.dataValues.email,
          phone_number: rep.dataValues.phone_number,
          job_title: rep.dataValues.job_title,
          role: rep.dataValues.role,
        },
        company: {
          id: rep.dataValues.companies[0]?.id,
          name: rep.dataValues.companies[0]?.name,
          company_type: rep.dataValues.companies[0]?.company_type,
        },
      }));
    },
  },

  Mutation: {
    createConnection: async (_, { input }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to create connections."
        );
      }

      const receiver = await dataSources.userAPI.getUserById(input.receiverId);
      if (!receiver) {
        throw new UserInputError("Receiver user not found.");
      }

      if (receiver.id === user.id) {
        throw new UserInputError(
          "You cannot create a connection with yourself."
        );
      }

      let connectionType;
      if (
        (user.role === "brand" && receiver.role === "rep") ||
        (user.role === "rep" && receiver.role === "brand")
      ) {
        connectionType = "BRAND_REP";
      } else if (
        (user.role === "rep" && receiver.role === "user") ||
        (user.role === "user" && receiver.role === "rep")
      ) {
        connectionType = "REP_RETAILER";
      } else {
        throw new UserInputError(
          "Invalid connection: roles do not match a valid connectionType."
        );
      }

      const existingConnection =
        await dataSources.connectionsAPI.findConnection({
          requesterId: user.id,
          receiverId: receiver.id,
        });
      if (existingConnection) {
        throw new UserInputError(
          "A connection between these users already exists."
        );
      }

      // 6) Crea la conexión
      const newConnection = await dataSources.connectionsAPI.createConnection({
        requesterId: user.id,
        receiverId: receiver.id,
        connectionType,
      });

      return newConnection;
    },

    acceptConnection: async (_, { input }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to accept connections."
        );
      }

      const connection = await dataSources.connectionsAPI.getConnectionById(
        input.connectionId
      );
      if (!connection) {
        throw new UserInputError("Connection not found.");
      }

      if (connection.receiverId !== user.id) {
        throw new AuthenticationError(
          "Only the receiver can accept this connection."
        );
      }

      if (connection.status !== "PENDING") {
        throw new UserInputError(
          "Connection is not in a valid state to be accepted."
        );
      }

      const updatedConnection =
        await dataSources.connectionsAPI.updateConnectionStatus(
          connection.id,
          "ACCEPTED"
        );

      return updatedConnection;
    },

    ignoreConnection: async (_, { input }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to ignore connections."
        );
      }

      const connection = await dataSources.connectionsAPI.getConnectionById(
        input.connectionId
      );
      if (!connection) {
        throw new UserInputError("Connection not found.");
      }

      if (connection.receiverId !== user.id) {
        throw new AuthenticationError(
          "Only the receiver can ignore this connection."
        );
      }

      if (connection.status !== "PENDING") {
        throw new UserInputError(
          "Connection is not in a valid state to be ignored."
        );
      }

      await dataSources.connectionsAPI.deleteConnection(connection.id);

      return true;
    },
  },

  Connection: {
    requester: (parent) => parent.Requester,
    receiver: (parent) => parent.Receiver,
  },
};

export default connectionsResolvers;
