// connectionsAPI.js
import { Op } from "sequelize";

/**
 * Clase de Data Source para gestionar las conexiones.
 * @param {Object} models - objeto con tus modelos de Sequelize (Connections, Users, etc.)
 */
export default class ConnectionsAPI {
  constructor({ models }) {
    this.models = models; // p. ej. { Connections: <SequelizeModel>, Users: <SequelizeModel>, ... }
  }

  /**
   * Devuelve una conexión por ID, opcionalmente con los datos del requester y receiver.
   * @param {number|string} id - ID de la conexión
   * @returns {Promise<Object|null>}
   */
  async getConnectionById(id) {
    return this.models.Connections.findByPk(id, {
      include: [
        // Suponiendo que configuraste en Sequelize las asociaciones:
        // Connections.belongsTo(Users, { as: "Requester", foreignKey: "requesterId" });
        // Connections.belongsTo(Users, { as: "Receiver", foreignKey: "receiverId" });
        { model: this.models.User, as: "requester" },
        { model: this.models.User, as: "receiver" },
      ],
    });
  }

  /**
   * Devuelve todas las conexiones (sin filtro), útil solo en casos específicos
   * o para un rol admin. Normalmente, aplicarás filtros (por userId, status, etc.).
   * @returns {Promise<Array>}
   */
  async getAllConnections() {
    return this.models.Connections.findAll({
      // Puedes incluir opcionalmente "Requester", "Receiver" si lo deseas:
      // include: [
      //   { model: this.models.Users, as: "Requester" },
      //   { model: this.models.Users, as: "Receiver" },
      // ],
    });
  }

  /**
   * Devuelve todas las conexiones en las que participa cierto user (requester o receiver).
   * Si se especifica `status`, se filtra por ese estado.
   * @param {Object} options - { userId, status }
   * @returns {Promise<Array>}
   */
  async getConnectionsByUserId({ userId, status }) {
    console.log(userId, status);
    const whereClause = {
      [Op.or]: [{ receiverId: userId }],
    };

    if (status) {
      // Si se provee status, filtramos también por estado
      whereClause.status = status; // PENDING / ACCEPTED / IGNORED / etc.
    }

    return this.models.Connections.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: this.models.User,
          as: "requester",
          attributes: ["id", "name"],
        },
        { model: this.models.User, as: "Receiver" },
      ],
    });
  }

  /**
   * Busca una conexión específica entre requester y receiver.
   * @param {Object} param - { requesterId, receiverId }
   * @returns {Promise<Object|null>}
   */
  async findConnection({ requesterId, receiverId }) {
    return this.models.Connections.findOne({
      where: { requesterId, receiverId },
    });
  }

  /**
   * Crea una nueva conexión en estado "PENDING".
   * @param {Object} param - { requesterId, receiverId, connectionType }
   * @returns {Promise<Object>} - la conexión recién creada
   */
  async createConnection({ requesterId, receiverId, connectionType }) {
    // Podrías validar que no exista otra conexión pend/accept con la misma pareja
    // antes de crear, pero normalmente ese check se hace en el resolver.
    return this.models.Connections.create({
      requesterId,
      receiverId,
      connectionType,
      status: "PENDING", // asumes que toda conexión nueva empieza en PENDING
    });
  }

  /**
   * Actualiza el estado de una conexión existente (p.ej. a ACCEPTED o IGNORED).
   * @param {number|string} connectionId
   * @param {string} newStatus - "ACCEPTED", "IGNORED", "PENDING", etc.
   * @returns {Promise<Object|null>} - la conexión actualizada, o null si no se encontró
   */
  async updateConnectionStatus(connectionId, newStatus) {
    // La mayoría de los motores (p. ej. Postgres) permiten "RETURNING: true" para devolver la fila actualizada
    const [rowsUpdated, [updatedConnection]] =
      await this.models.Connections.update(
        { status: newStatus },
        {
          where: { id: connectionId },
          returning: true, // Solo funciona en Postgres y algunos DB que soporten RETURNING
        }
      );

    if (!rowsUpdated) {
      return null; // No se encontró la conexión
    }
    return updatedConnection;
  }

  /**
   * Elimina completamente la conexión de la BD (si quisieras un "borrado lógico",
   * usarías paranoid: true en el modelo, etc.).
   * @param {number|string} connectionId
   * @returns {Promise<boolean>} - true si se eliminó, false si no existía
   */
  async deleteConnection(connectionId) {
    const deletedCount = await this.models.Connections.destroy({
      where: { id: connectionId },
    });
    return deletedCount > 0;
  }

  async getConnections(userId) {
    console.log(userId);
    return this.models.Connections.findAll({
      where: {
        [Op.or]: [{ requesterId: userId }, { receiverId: userId }],
        status: { [Op.in]: ["PENDING", "ACCEPTED"] },
      },
      include: [
        {
          model: this.models.User,
          as: "requester",
          attributes: ["id", "name", "email", "phone_number", "job_title"],
        },
        {
          model: this.models.User,
          as: "receiver",
          attributes: ["id", "name", "email", "phone_number", "job_title"],
        },
      ],
    });
  }

  async getConnectionsByType(userId, connectionType) {
    try {
      return await this.models.Connections.findAll({
        where: {
          [Op.or]: [{ receiverId: userId }],
          connectionType: connectionType,
        },
        include: [
          {
            model: this.models.User,
            as: "requester",
            attributes: ["id", "name", "email", "phone_number", "job_title"],
            include: [
              {
                model: this.models.Companies,
                as: "companies",
                attributes: ["id", "name"],
                include: [
                  {
                    model: this.models.Designer,
                    as: "designer",
                    attributes: ["id", "slug", "name"],
                  },
                ],
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching connections:", error);
      throw new Error("Error fetching connections");
    }
  }
}
