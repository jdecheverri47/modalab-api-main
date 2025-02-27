import { DataSource } from 'apollo-datasource';
import User from '../../models/userModel.js'; // Asegúrate de que la ruta sea correcta

class NavigatorAPI extends DataSource {
  constructor({ sequelize }) {
    super();
    this.sequelize = sequelize; // Guarda la instancia de Sequelize
  }

  async getUserById(id) {
    return await User.findByPk(id);
  }

  async getAllUsers() {
    return await User.findAll();
  }

  async createUser(userInput) {
    return await User.create(userInput);
  }

  async updateUser(id, userInput) {
    const user = await User.findByPk(id);
    if (user) {
      return await user.update(userInput);
    }
    return null;
  }

  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      return user;
    }
    return null;
  }
}

export default NavigatorAPI;
