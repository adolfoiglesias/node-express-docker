const express = require('express');
const DataSource = require('./config/db');
const cors = require('cors');
require('dotenv').config({ path: './config/variables.env' });

const Response = require('./utils/response');
const auth = require('./middleware/auth');
const TourService = require('./tour/services/tourService');
const ReservacionService = require('./reservation/services/reservationService');
const UserService = require('./access/services/userService');

// crear el servidor
const app = express();

console.log("APP NODE_ENV " + process.env.NODE_ENV);

// Conectar a la base de datos
console.log('conectando.. a la bd..')
if(process.env.NODE_ENV !== 'test'){
     
    DataSource.connectDB().then( async () => {
        UserService.init();
        TourService.init();
        ReservacionService.init();
    });
}
   // habilitar cors
   app.use(cors());

   // Habilitar express.json
   app.use( express.json({ extended: true }));

   // puerto de la app
   const port = process.env.PORT || 4000;

   // Importar rutas
   app.use('/api/auth', require('./security/routes.js'));
   app.use('/api/access', auth, require('./access/routes.js'));
   app.use('/api/tours', auth, require('./tour/routes.js'));
   app.use('/api/reservations', auth , require('./reservation/routes.js'));
   /*
   app.use('/api/customers', auth, require('./routes/toursRoute.js'));
   app.use('/api/portal/profile/*', auth, require('./routes/toursRoute.js'));
   app.use('/api/portal', require('./routes/toursRoute.js'));
   */

   // catch undefined routes and respond with 404
   app.use(function(req, res, next) {
        Response.error(res, 400, null, 'wrong route');
   });
   
   // catch server errors and respond with 500
   app.use(function (err, req, res, next) {
       console.error(err.stack)
       res.status(500).send('Something broke!')
   })
   

   // starting server...
   app.listen(port, () => {
       console.log(`El servidor esta funcionando en el puerto ${port}`);
   });
   // arrancar la app
   /*
   app.listen(port, '0.0.0.0', () => {
       console.log(`El servidor esta funcionando en el puerto ${port}`);
   });*/

   module.exports = app;
