const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: process.env.DIALECT,
    host: process.env.DB_HOST,
    port: process.env.MYSQLPORT,
    logging: true,
    operatorAlias: false,
    
    pool: {
        max: 5,
        idle: 30000,
        acquire: 60000,
    },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

async function initializeSequelize() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (error) {
        console.error("Error initializing Sequelize:", error);
    }
}

module.exports = { db, sequelize, initializeSequelize };
