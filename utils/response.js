const Response = {

    ok: (res, data, msg = 'OK') => {
        const response = {
            error: false,
            data:data, 
            msg: msg
        }
        return res.json(response);
    }, 
    error: (res, code, data, msg) => {

        const response = {
            error: true,
            data:data, 
            msg: msg ? msg : Response.getErrorMSG(code)
        }
        return res.status(400).json(response);
    },

    getErrorMSG: code => {
        if(code === 400) {
            return Response.MSG_400();
        }else if(code === 500){
            return Response.MSG_500();
        }else if(code === 404){
            return Response.MSG_404();
        }else if(code === 403){
            return Response.MSG_403();
        }else {
            return 'Error inesperado'
        }
    },

    MSG_400: msg => {
        return msg ? msg : 'Ocurrio un error inesperado code : 400'
    }, 
    MSG_500: msg => {
        return msg ? msg : 'Ocurrio un error inesperado code : 500'
    }, 
    MSG_404: msg => {
        return msg ? msg : 'Objecto no encontrado '
    }, 
    MSG_403: msg => {
        return msg ? msg : 'No tiene acceso a recurso solicitado'
    }
}

module.exports = Response;