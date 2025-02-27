// testConnection.js

import sequelize from '../config/database.js'; // Ajusta la ruta según tu estructura de carpetas

const testConnection = async () => {
  try {
    await sequelize.authenticate(); // Verifica la conexión
    console.log('Connection has been established successfully.');

    // Realiza una consulta simple para verificar
    const [results, metadata] = await sequelize.query('SELECT NOW() AS current_time');
    console.log('Current time:', results[0].current_time);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close(); // Cierra la conexión
  }
};

testConnection();
