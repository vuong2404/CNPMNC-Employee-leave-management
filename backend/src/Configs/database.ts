require('dotenv').config()

const config = {
    dialect: process.env.DB_DIALECT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialectOptions: {
      ssl: true,
    },

  };
  
module.exports = config