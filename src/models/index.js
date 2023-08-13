const EmailCode = require("./EmailCode")
const User = require("./User");

//Relacion de 1 a 1

//User solo puede tener un Email codigo
User.hasOne(EmailCode) // userId
//un Email Codigo pertenece a solo un Usuario
EmailCode.belongsTo(User)