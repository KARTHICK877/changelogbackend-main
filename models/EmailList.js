const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbconfig/configuration');
  
const EmailList = sequelize.define('EmailList', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  
    validate: {
      isEmail: true,  
    },
  },
});

module.exports = EmailList;
