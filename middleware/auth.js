const jwt = require('jsonwebtoken');

module.exports = async (err, req, res, next) => {
    // Leer el token del header
    //const token = req.header('x-auth-token');

    if(process.env.NODE_ENV === 'test'){
        return next();
    }

    const keyHeader = 'Authorization';
    
    const token = req.header(keyHeader).split('Bearer')[1].trim();

    // Revisar si no hay token
    if(!token) {
        return res.status(401).json({msg: 'No hay Token, permiso no válido'})
    }

    // validar el token

    try {
        const cifrado = await jwt.verify(token, process.env.JWT_SECRETA);
        req.usuario = cifrado.usuario;
        return next();
    } catch (error) {
        res.status(401).json({msg: 'Token no válido'});
    }
}