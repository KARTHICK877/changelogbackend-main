// models/Post.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbconfig/configuration');

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true // Assuming image is optional
  },
  tag: {
    type: DataTypes.ENUM('New','Improved', 'Fixed'),
    allowNull: true 
  }
});

module.exports = Post;
