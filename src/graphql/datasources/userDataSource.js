import { DataSource } from "apollo-datasource";
import { Op } from "sequelize";

class UserAPI extends DataSource {
  constructor({ models }) {
    super();
    this.models = models;
  }

  async findUserByEmail(email) {
    return await this.models.User.scope("withPassword").findOne({
      where: { email },
    });
  }

  async createUser(userData) {
    return await this.models.User.create(userData);
  }

  async getUserById(id) {
    return await this.models.User.findByPk(id);
  }
  z;
  async getAllUsers() {
    return await this.models.User.findAll();
  }

  async updateUserById(id, data) {
    const user = await this.models.User.findByPk(id);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const allowedFields = ["name", "email", "phoneNumber", "jobTitle", "role"];
    const dataToUpdate = {};

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        dataToUpdate[field] = data[field];
      }
    });

    await user.update(dataToUpdate);

    return user;
  }

  async deleteUserById(id) {
    const user = await this.models.User.findByPk(id);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await user.destroy();
  }

  async activateUser(userId) {
    const user = await this.models.User.findByPk(userId);
    if (user) {
      user.enable = true;
      await user.save();
    }
    return user;
  }

  async updatePassword(userId, hashedPassword) {
    const user = await this.models.User.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.password = hashedPassword;
    await user.save();

    return user;
  }

  async getAvailableReps(excludedIds) {
    return this.models.User.findAll({
      where: {
        role: "rep",
        id: { [Op.notIn]: excludedIds },
      },
      include: [
        {
          model: this.models.Companies,
          as: "companies",
        },
      ],
    });
  }
}

export default UserAPI;
