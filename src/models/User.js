const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');
//importamos bcrypt
const bcrypt = require("bcrypt")

const User = sequelize.define('user', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        //propiedad para que el email no se repita
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        //tipo text porq la imagen tiene bastantes caracteres
        type: DataTypes.TEXT,
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        //debe ser booleano por solo necesitamos saber si es verificado o no
        allowNull: false,
        defaultValue: false
    },
});


User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
}

User.beforeCreate(async (user) => {
    const hashPassword = await bcrypt.hash(user.password, 10)
    user.password = hashPassword 
})


module.exports = User;