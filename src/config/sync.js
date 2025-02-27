import sequelize from './database.js';

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true }, { alter: true }); // O usa { alter: true } según necesites
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

syncDatabase();
