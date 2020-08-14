
const TourService = require('../services/tourService');
const Response = require('../../utils/response');

const TourController = {

    findAll: (req, res) => {
        TourService.findAll(req.query.name).then(list => {
             return Response.ok(res, list);   
        }, error => {
            return Response.error(500, res, 'error')
        });
    }, 
    save: (req, res) => {
        
        TourService.save(req.body).then(data => {
            return Response.ok(res, data);
        }, error => {
            return Response.error(500, res, 'error')
        });

    }, 
    update : ()=> {
        TourService.update(req.params.id, req.body).then(data => {
            return Response.ok(res, data);
        }, error => {
            return Response.error(500, res, 'error')
        });
    }, 
    delete: ()=> {

        TourService.remove(req.params.id).then(data => {
            return Response.ok(res, {});
        }, error => {
            return Response.error(500, res, 'error')
        });
    }
}

module.exports = TourController;
