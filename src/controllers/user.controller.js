const catchError = require('../utils/catchError');
const User = require('../models/User');
const { verifyAccount } = require('../utils/verifyAccount');
const EmailCode = require('../models/EmailCode');
const bscrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { sendEmailResetPassword } = require("../utils/sendEmailResetPassword")

const getAll = catchError(async(req, res) => {
    const results = await User.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    //capturamos estos datos
    const {email, firstName, frontBaseUrl } = req.body
    const result = await User.create(req.body);
    const code = require("crypto").randomBytes(64).toString("hex")
    console.log(code)
    // importamos verify account y le enviamos los datos
    verifyAccount(email, firstName, frontBaseUrl, code)
    //enviamos datos a la tabla emailCode
    await EmailCode.create({ code, userId: result.id})
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await User.destroy({ where: {id} });
    if(!result) return res.sendStatus(404);
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    //restringimos actualizacion de password
    delete req.body.password
    //restringimos actualizacion de verificacion
    delete req.body.isVerified
    //restringimos la actualizacion del email
    delete req.body.email
    const result = await User.update(
        req.body,
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const verifyUser = catchError(async (req, res) => {
    const { code } = req.params
    //Buscamos en emailCode que encuentre uno registro que sea igual a code
    const emailCode = await EmailCode.findOne({ where: { code }})
    //en caso de que no encuentre el hash en la tabla emailCodes
    if(!emailCode) return res.sendStatus(401)

    //Pasamos a true isVerified donde el id ed user sea igual
    //al  id de emailCodes
    const user = await User.update(
        {isVerified: true},
        {where: { id: emailCode.userId }, returning: true}
    )

    if(user[0] === 0) return res.sendStatus(404);
    //elimino la instancia
    await emailCode.destroy()
    return res.json(user[1][0])

})

const login = catchError(async (req, res) => {
    //desestructuramos req.body para traernos las varaibles de los campos
    const { email, password} = req.body
    //preguntamos por el registro q coincida con el email
    const user = await User.findOne({ where: { email } })
    //si el usuario no existe le mandamos No autorizado
    if(!User) return res.sendStatus(401)
    //si el usuario tiene false en isVerified no lo autorizamos
    if(!user.isVerified) res.sendStatus(401)
    //comparamos el password ingresado con el registro encontrado en findOne 
    const isValid = await bscrypt.compare(password, user.password)
    //si no es igual entonces mandamos un 404
    if(!isValid)  return res.sendStatus(404)

    // libreria cargara el user y le asignara el hash q guardamos en el .env 
    // y le asignara el TOKEN unico
    const token = jwt.sign(
        //algo para cargar
        { user },
        //clave secreta o privada
        process.env.TOKEN_SECRET,
        //timpo de expiracion del token
        { expiresIn: "1d"}
    )
    //retornamos el usuario y el token
    return res.json({user, token})
})

const logged = catchError(async (req, res) => {
    const user = req.user
    return res.json(user)
})


//SEGMENTO DE CODIGO PARA RESTABLECER LA CONTRASEÑA 
const resetPassword = catchError(async (req, res) => {
    // desestructuramos req
    const { email, frontBaseUrl} = req.body
    //preguntamos si existe el email en nuestra db con el metodo findOne
    const user = await User.findOne({ where: { email }})
    //si no existe el usuario retorna un 401
    if(!user) return res.sendStatus(401)

    //Generamos un hash y lo guardamos en una variable
    const code = require("crypto").randomBytes(64).toString("hex")

    //esta funcion va a recibir el email, el firstName, la URL y el Hash 
    //estos datos los necesita el mensaje que vamos a preparar para enviar al correo del usuario
    sendEmailResetPassword(email, user.firstName, frontBaseUrl, code)

    //en el modelo emailcode que es donde se guardan las contraseñas enviamos el code 
    //donde el userId sea igual al user que trajimo con el metodo findOne
    await EmailCode.create({ code, userId: user.id})

    return res.json(user)
})


const updatePassword = catchError(async(req, res) => {
    //Desestructuramos req y recibimos el parametro
    const { code } = req.params
    //buscamos el registro que contenga ese codigo en la tabla emailCode
    //y lo guardamos en una variable con nombre emailCode
    const emailCode = await EmailCode.findOne({ where: { code }})
    //en caso de que no exista retornamos un 401
    if(!emailCode) return res.sendStatus(401)

    //encriptamos la contraseña que viene por el body
    const hashPassword = await bscrypt.hash(req.body.password, 10)

    //actualizamos la contraseña del usuario
    const user = await User.update(
        //actualizamos la columna password y le pasamos la contraseña actualizada
        { password: hashPassword },
        //donde el id sea igual a emailCode.userId, y nos retorne los datos actualizados
        { where: { id: emailCode.userId }, returning: true }
    )
    
    //si user no actualiza nada entonces devolvemos un 404
    if(user[0] === 0) return res.sendStatus(404);
    // borramos los datos de la tabla emailCode
    await emailCode.destroy()
    //retornamos la actualizacion el la posicion [1] luego en la [0]
    return res.json(user[0],[1])
})

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    verifyUser,
    login,
    logged,
    resetPassword,
    updatePassword
}