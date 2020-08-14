
const ReservationService = require('../services/reservationService');
const Response = require('../../utils/response');
const ReservationException = require('../exceptions/reservationException');

const ReservationController = {

    findAll: (req, res) => {
        ReservationService.findAll().then(list => {
             return Response.ok(res, list);   
        }, error => {
            return Response.error(500, res, 'error')
        });
    }, 
    save: async (req, res) => {
        
        try {
            
            await ReservationService.save(req.body);

        } catch (error) {
            if(error instanceof ReservationException) {
                
                return Response.error(res, 400, error.getErrors(), error.message);

            } else if(error instanceof ValidationError){
                return Response.error(res, 400, error.getErrors(), error.message);
            }else {
                return Response.error(500, res, 'error', 'Unexpected error ');
            }
        }
    }, 
    update : ()=> {
        ReservationService.update(req.params.id, req.body).then(data => {
            return Response.ok(res, data);
        }, error => {
            return Response.error(500, res, 'error')
        });
    }, 
    delete: ()=> {

        ReservationService.delete(req.params.id).then(data => {
            return Response.ok(res, data);
        }, error => {
            return Response.error(500, res, 'error')
        });
    }
}
module.exports = ReservationController;