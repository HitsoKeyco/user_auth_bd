const express = require('express');
const router = express.Router();
const routerUser = require('./user.route')

// colocar las rutas aquí
router.use('/users', routerUser)


module.exports = router;