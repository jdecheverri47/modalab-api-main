import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server-express";
import { hasRole } from "../../config/authorization.js";
import { v4 as uuidv4 } from "uuid";
import sequelize from "../../config/database.js";
import {
  sendRegisterEmail,
  sendActivationEmailToAdmin,
  sendConfirmationEmail,
  sendActivationEmailBrands,
  sendResetPasswordEmail,
  sendConfirmUserWithData,
} from "../../config/emails.js";

const userResolvers = {
  Query: {
    users: async (parent, { id }, { dataSources, user }) => {
      hasRole({ user }, ["admin"]);
      if (id) {
        // Si se pasa un ID, obtenemos solo el usuario por ID
        return [await dataSources.userAPI.getUserById(id)];
      } else {
        // Si no hay ID, obtenemos todos los usuarios
        return await dataSources.userAPI.getAllUsers();
      }
    },
    getUserAddresses: async (parent, __, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("No autenticado");
      }

      try {
        return await dataSources.addressesAPI.getAddressesByUserId(user.id);
      } catch (error) {
        console.error("Error al obtener las direcciones del usuario:", error);
        throw new Error(
          "Ocurrió un error al obtener las direcciones del usuario"
        );
      }
    },
    me: async (parent, __, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("No autenticado");
      }

      try {
        return await dataSources.userAPI.getUserById(user.id);
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
        throw new Error("Ocurrió un error al obtener el usuario");
      }
    },
  },
  User: {
    // Resolver para el campo orders en User
    orders: async (parent, args, { dataSources }) => {
      try {
        // Utiliza el data source de Order para obtener las órdenes del usuario
        const orders = await dataSources.ordersAPI.getOrdersByUserId(parent.id);
        return orders;
      } catch (error) {
        console.error("Error al obtener las órdenes del usuario:", error);
        throw new Error("Ocurrió un error al obtener las órdenes del usuario");
      }
    },
  },
  Mutation: {
    registerUser: async (parent, { input }, { dataSources }) => {
      const { email, password, name, phoneNumber, jobTitle, role } = input;

      try {
        // Check if the user already exists
        const existingUser = await dataSources.userAPI.findUserByEmail(email);
        if (existingUser) {
          throw new UserInputError("User already exists", {
            invalidArgs: ["email"],
          });
        }

        // Input validation
        if (!email || !password || !name) {
          throw new UserInputError("Missing required fields", {
            invalidArgs: ["email", "password", "name"],
          });
        }

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!hashedPassword) {
          throw new Error("Error hashing password");
        }

        // Generate UID for the user
        const id = uuidv4().substring(0, 36);

        // Create the new user
        const newUser = await dataSources.userAPI.createUser({
          id,
          email,
          password: hashedPassword,
          name,
          phoneNumber,
          jobTitle,
          role,
        });

        if (!newUser) {
          throw new Error("Error creating the user");
        }

        // Generate a JWT token
        const token = jwt.sign(
          { id: newUser.id, email: newUser.email, role: newUser.role },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );

        if (!token) {
          throw new AuthenticationError(
            "Error generating authentication token"
          );
        }

        await sendRegisterEmail({
          email: newUser.email,
          name: newUser.name,
        });

        await sendActivationEmailToAdmin(newUser, token);

        return { token, message: "User registered successfully" };
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error; // Known input errors
        } else if (error instanceof AuthenticationError) {
          throw error; // Authentication error
        } else {
          // Log any other error
          console.error("Error in registerUser:", error);
          throw new Error("Internal server error");
        }
      }
    },

    deleteUser: async (parent, { id }, { dataSources, user }) => {
      // Verificar que el usuario está autenticado y tiene rol 'admin'
      hasRole({ user }, ["admin"]);

      // Intentar eliminar el usuario
      try {
        const userToDelete = await dataSources.userAPI.getUserById(id);

        if (!userToDelete) {
          throw new UserInputError("Usuario no encontrado");
        }

        await dataSources.userAPI.deleteUserById(id);

        return { message: "Usuario eliminado exitosamente" };
      } catch (error) {
        console.error("Error eliminando usuario:", error);
        throw new Error("Error eliminando usuario");
      }
    },

    login: async (parent, { email, password }, { dataSources }) => {
      try {
        // 1. Validación de entradas
        if (!email || !password) {
          throw new AuthenticationError("Invalid credentials");
        }

        // Sanitizar el email (opcional, según tu framework)
        const sanitizedEmail = email.trim().toLowerCase();

        // 2. Buscar al usuario por email
        const user = await dataSources.userAPI.findUserByEmail(sanitizedEmail);

        // 3. Verificar si el usuario existe y está habilitado
        if (!user || !user.enable) {
          // 4. Mensaje genérico para evitar enumeración de usuarios
          throw new AuthenticationError("Invalid credentials");
        }

        // 5. Verificar la contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          // Podrías implementar un contador de intentos fallidos aquí
          throw new AuthenticationError("Invalid credentials");
        }

        // 1. Obtener la compañía utilizando el user.id
        const company = await dataSources.companyAPI.getCompanyByUserId(
          user.id
        );

        // Verificar que la compañía exista
        if (!company) {
          throw new Error("Compañía no encontrada para el usuario");
        }

        // 6. Cargar datos adicionales después de la autenticación exitosa
        const [companyDetails, addresses] = await Promise.all([
          dataSources.retailersDetailsAPI.getRetailersDetailsByCompanyId(
            company.id
          ),
          dataSources.addressesAPI.getAddressesByCompanyId(company.id),
        ]);

        // 7. Generar un token JWT de forma segura
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );

        // 8. Retornar los datos necesarios
        return { token, user, company, companyDetails, addresses };
      } catch (error) {
        // 9. Manejo de errores inesperados
        console.error("Error in login:", error);
        throw new AuthenticationError("Error processing login");
      }
    },

    updateUser: async (parent, { input }, { dataSources, user }) => {
      // Intentar actualizar el usuario
      try {
        const userToUpdate = await dataSources.userAPI.getUserById(user.id);

        if (!userToUpdate) {
          throw new UserInputError("Usuario no encontrado");
        }

        // Actualizar los campos permitidos
        await dataSources.userAPI.updateUserById(user.id, input);

        // Obtener el usuario actualizado
        const updatedUser = await dataSources.userAPI.getUserById(user.id);

        return {
          message: "User updated successfully",
          user: updatedUser,
        };
      } catch (error) {
        console.error("Error actualizando usuario:", error);
        throw new Error("Ocurrió un error al actualizar el usuario");
      }
    },

    registerRetailer: async (parent, { input }, { dataSources }, context) => {
      const {
        user: userInput,
        company: companyInput,
        retailerDetails: retailersDetailsInput,
        addresses,
      } = input;

      const { email, password, name, phoneNumber, jobTitle } = userInput;

      const transaction = await sequelize.transaction();
      console.log("transaction created");
      try {
        // Verificar si el usuario ya existe
        const existingUser = await dataSources.userAPI.findUserByEmail(email);
        if (existingUser) {
          throw new Error("El usuario ya existe");
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const newUser = await dataSources.userAPI.createUser(
          {
            email: email,
            password: hashedPassword,
            name: name,
            phone_number: phoneNumber,
            job_title: jobTitle,
            role: "user",
          },
          { transaction }
        );

        // Crear la compañía
        const newCompany = await dataSources.companyAPI.createCompany(
          {
            name: companyInput.name,
            user_id: newUser.id, // Asociar con el usuario
            company_type: "retailer",
          },
          { transaction }
        );

        console.log("company created", newCompany);

        // Crear los detalles del retailer
        const newRetailerDetails =
          await dataSources.retailersDetailsAPI.createRetailerDetails(
            {
              company_id: newCompany.id,
              ...retailersDetailsInput,
            },
            { transaction }
          );

        for (const addressInput of addresses) {
          // Crear las direcciones
          await dataSources.addressesAPI.createAddress(
            {
              ...addressInput,
              company_id: newCompany.id,
            },
            { transaction }
          );
        }

        console.log("addresses created");
        await transaction.commit();

        // Generar un token JWT
        const token = jwt.sign(
          { id: newUser.id, email: newUser.email, role: newUser.role },
          process.env.JWT_SECRET,
          { expiresIn: "3d" }
        );

        await sendRegisterEmail(newUser.email, newUser.name);
        await sendActivationEmailToAdmin(
          newUser,
          token,
          newCompany,
          retailersDetailsInput,
          addresses
        );

        return { token, message: "Retailer Successfully registered" };
      } catch (error) {
        console.error("Error registrando retailer:", error);
        await transaction.rollback();
        throw new Error("Error registrando retailer");
      }
    },

    registerBrand: async (parent, { input }, { dataSources }, context) => {
      const {
        user: userInput,
        company: companyInput,
        brandDetails: brandDetailsInput,
        addresses,
      } = input;

      const { email, password, name, phoneNumber, jobTitle } = userInput;

      const transaction = await sequelize.transaction();
      console.log("transaction created");
      try {
        // Verificar si el usuario ya existe
        const existingUser = await dataSources.userAPI.findUserByEmail(email);
        if (existingUser) {
          throw new Error("El usuario ya existe");
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const newUser = await dataSources.userAPI.createUser(
          {
            email: email,
            password: hashedPassword,
            name: name,
            phone_number: phoneNumber,
            job_title: jobTitle,
            role: "user",
          },
          { transaction }
        );

        // Crear la compañía
        const newCompany = await dataSources.companyAPI.createCompany(
          {
            name: companyInput.name,
            user_id: newUser.id, // Asociar con el usuario
            company_type: "brand",
          },
          { transaction }
        );
        console.log("company created");
        console.log("creating retailer details");
        // Crear los detalles del retailer
        const newBrandDetails = await dataSources.brandAPI.createBrandDetails(
          {
            ...brandDetailsInput,
            company_id: newCompany.id,
          },
          { transaction }
        );

        console.log("retailer details created");

        console.log("first address");

        for (const addressInput of addresses) {
          // Crear las direcciones
          await dataSources.addressesAPI.createAddress(
            {
              ...addressInput,
              company_id: newCompany.id,
            },
            { transaction }
          );
        }

        console.log("addresses created");
        await transaction.commit();

        // Generar un token JWT
        const token = jwt.sign(
          { id: newUser.id, email: newUser.email, role: newUser.role },
          process.env.JWT_SECRET,
          { expiresIn: "3d" }
        );

        await sendRegisterEmail(newUser.email, newUser.name);
        await sendActivationEmailBrands(
          newUser,
          token,
          newCompany,
          newBrandDetails,
          addresses
        );

        return { token, message: "Brand Successfully registered" };
      } catch (error) {
        await transaction.rollback();
        console.error("Something wrong happened:", error);
        throw new Error("Something wrong happened");
      }
    },

    activateUser: async (parent, { token }, { dataSources }) => {
      try {
        // Verificar el token de activación
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar el usuario por ID
        const user = await dataSources.userAPI.getUserById(decodedToken.id);

        if (!user) {
          throw new Error("User not found");
        }

        if (user.enable) {
          throw new Error("User is already active.");
        }

        // Activar al usuario
        await dataSources.userAPI.activateUser(user.id);
        await sendConfirmationEmail(user.email, user.name);
        return {
          message: "User activated successfully",
        };
      } catch (error) {
        return {
          message: "Error activating user: " + error.message,
        };
      }
    },

    resetPassword: async (parent, { email }, { dataSources }) => {
      try {
        // Buscar al usuario por email
        const user = await dataSources.userAPI.findUserByEmail(email);

        if (!user) {
          throw new Error("User not found");
        }

        // Generar un token de reseteo de contraseña
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        // Enviar el email de reseteo de contraseña
        await sendResetPasswordEmail(user.email, user.name, token);

        return {
          message: "Password reset email sent",
        };
      } catch (error) {
        return {
          message: "Error sending password reset email: " + error.message,
        };
      }
    },

    updatePassword: async (
      parent,
      { token, password },
      { dataSources, user }
    ) => {
      try {
        if (!password) {
          throw new Error("Password is required");
        }

        let userId;

        if (token) {
          // Verificar el token de reseteo de contraseña
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
          userId = decodedToken.id;
        } else if (user && user.id) {
          // Usar el ID del usuario autenticado
          userId = user.id;
        } else {
          throw new Error("Not authenticated");
        }

        // Buscar al usuario por ID
        const userRecord = await dataSources.userAPI.getUserById(userId);

        if (!userRecord) {
          throw new Error("User not found");
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar la contraseña
        await dataSources.userAPI.updatePassword(userId, hashedPassword);

        return {
          message: "Password updated successfully",
        };
      } catch (error) {
        return {
          message: "Error updating password: " + error.message,
        };
      }
    },

    quickRetailerRegister: async (
      parent,
      { input },
      { dataSources },
      context
    ) => {
      const { user: userInput, company: companyInput } = input;

      const { email, password, name, phoneNumber, jobTitle } = userInput;

      const transaction = await sequelize.transaction();
      console.log("transaction created");
      try {
        const existingUser = await dataSources.userAPI.findUserByEmail(email);
        if (existingUser) {
          console.log("User already exists");
          throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await dataSources.userAPI.createUser(
          {
            email: email,
            password: hashedPassword,
            name: name,
            phone_number: phoneNumber,
            job_title: jobTitle,
            role: "user",
            enable: true,
          },
          { transaction }
        );

        const newCompany = await dataSources.companyAPI.createCompany(
          {
            name: companyInput.name,
            user_id: newUser.id,
            company_type: "retailer",
          },
          { transaction }
        );

        console.log("company created", newCompany);

        await transaction.commit();

        const token = jwt.sign(
          { id: newUser.id, email: newUser.email, role: newUser.role },
          process.env.JWT_SECRET,
          { expiresIn: "3d" }
        );

        await sendRegisterEmail(newUser.email, newUser.name);
        await sendConfirmUserWithData({
          name: newUser.name ?? "Retailer",
          email: email,
          password: password,
        });

        return { token, message: "Retailer Successfully registered" };
      } catch (error) {
        console.error(`Oh oh,${error.message}`);
        await transaction.rollback();
        throw new Error(`Oh oh, ${error.message}`);
      }
    },
    registerAddress: async (parent, { input }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("No autenticado");
      }

      const company = await dataSources.companyAPI.getCompanyByUserId(user.id);

      try {
        const newAddress = await dataSources.addressesAPI.createAddress({
          ...input,
          company_id: company.id,
        });

        return {
          message: "Dirección registrada exitosamente",
          address: newAddress,
        };
      } catch (error) {
        console.error("Error registrando dirección:", error);
        throw new Error("Ocurrió un error al registrar la dirección");
      }
    },
    updateAddress: async (parent, { id, input }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("Not Authenticated");
      }

      const company = await dataSources.companyAPI.getCompanyByUserId(user.id);

      try {
        const address = await dataSources.addressesAPI.getAddressesById(id);

        if (!address) {
          throw new UserInputError("Address not found");
        }

        if (address.company_id !== company.id) {
          throw new ForbiddenError("You don't have permission to update this");
        }

        const updatedAddress = await dataSources.addressesAPI.updateAddress(
          id,
          input
        );

        return {
          message: "Address updated successfully",
          address: updatedAddress,
        };
      } catch (error) {
        console.error("Error updating address:", error);
        throw new Error("Something went wrong updating the address");
      }
    },
    deleteAddress: async (parent, { id }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("Not Authenticated");
      }

      const company = await dataSources.companyAPI.getCompanyByUserId(user.id);

      try {
        const address = await dataSources.addressesAPI.getAddressesById(id);

        if (!address) {
          throw new UserInputError("Address not found");
        }

        if (address.company_id !== company.id) {
          throw new ForbiddenError("You don't have permission to delete this");
        }

        await dataSources.addressesAPI.deleteAddress(id);

        return {
          message: "Address deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting address:", error);
        throw new Error("Something went wrong deleting the address");
      }
    },
  },
};

export default userResolvers;
