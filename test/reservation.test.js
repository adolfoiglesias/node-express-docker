
const assert = require('assert');


const ReservationService = require('../reservation/services/reservationService');
const reservationModel = require('../reservation/models/ReservationModel');
const TourModel = require('../tour/models/tour');
const CustomerModel = require('../reservation/models/CustomerModel');

const PaymentStatus = require('../reservation/models/PaymentStatus');

const moment = require('moment');
const ReservationModel = require('../reservation/models/ReservationModel');
const LoginTypeEnum = require('../reservation/models/LoginTypeEnum');
const ReservationException = require('../reservation/exceptions/reservationException');


describe('Reservation testing', () => {

    beforeEach( async () => {
        console.log('Reservation beforeEach started ');
        
        // insertr datos en la BD
       // await TourService.init();    
       await  ReservationService.init();
        console.log('Reservation beforeEach ended ');
    });
    
    afterEach( async () => {
        console.log('Reservation afterEach testing');
    
        // eliminar datos de la BD
        await reservationModel.deleteMany({});
        await CustomerModel.deleteMany({});
        await TourModel.deleteMany({});
    
        console.log('Reservation afterEach testing ended');
    });
    

    it('When list all reservation then there must be 4 reservation',  (done)  => {
        
        ReservationService.findAll().then(data => {
            assert(data.length === 4);    
            done();
         });
    });

    it('When list reservation by customer then there must be 2 reservation', async ()  => {
        
        const customerEmail = 'customer1@gmail.com';
        const reservations = await ReservationService.findAll();
        const rxs = await ReservationService.findAllByCustomer(customerEmail);
        assert(rxs.length === 2);
    });


    it('When choose reservation then it must shows that reservation',  async ()  => {
        
        let  rx = await reservationModel.find({}).limit(1).exec();
        console.log(rx);
        rx =  await ReservationService.findById(rx[0]._id);


        console.log(rx);

        assert(rx !== null);
    });


    it('When create reservation valid it must create new reservation', async () => {

        const tour = await TourModel.find({name: 'Tour 1'}).limit(1).exec();
        const customer = await CustomerModel.find({email: 'customer2@gmail.com'}).limit(1).exec();

        console.log("Tour....");
        console.log(tour);

        console.log('Customer....');
        console.log(customer);

        const rx = {
            customer: customer[0], 
            tour: {
                _id: tour[0]._id
            }, 
            reservationDate: moment().add('4', 'd'),
            pax: 3,
            payment: {
                totalPrice: 100,
                status: PaymentStatus.PAID,
                payments: [{
                    price:100,
                    status: PaymentStatus.PAID
                }]
            }
        }

        await ReservationService.save(rx);
        const total = ReservationModel.find({}).estimatedDocumentCount();
        assert(total, 5);

        
        const rxByCustomer = await ReservationModel
                                .find({'reservationDate': rx.reservationDate, 'customer': customer})
                                .limit(1)
                                .exec();
        console.log('Rx by customer....');
        console.log(rxByCustomer)
        assert(rxByCustomer.length === 1);
        assert(rxByCustomer[0].payment.totalPrice === rx.payment.totalPrice);

    });


    it('When create reservation with invalid or miss data it must throw exception ', async () => {

        const tour = await TourModel.find({name: 'Tour 1'}).limit(1).exec();
        const customer = await CustomerModel.find({email: 'customer2@gmail.com'}).limit(1).exec();
         
        let rx = {
            customer: customer[0], 
            tour: {
                _id: tour[0]._id
            }, 
            reservationDate: moment().add('-4', 'd'),
            pax: 3,
            payment: {
                totalPrice: 100,
                status: PaymentStatus.PAID,
                payments: [{
                    price:100,
                    status: PaymentStatus.PAID
                }]
            }
        }

        try {
            await ReservationService.save(rx);
                
        } catch (error) {
            console.log(error);
            assert (error instanceof ReservationException)
            assert(error.getErrors() !== null);
        }

        rx = {
            customer: {}, 
            tour: {
                _id: tour[0]._id
            }, 
            reservationDate: moment().add('4', 'd'),
            pax: 3,
            payment: {
                totalPrice: 100,
                status: PaymentStatus.PAID,
                payments: [{
                    price:100,
                    status: PaymentStatus.PAID
                }]
            }
        }

        try {
            await ReservationService.save(rx);
        } catch (error) {
            console.log(error);
            assert (error.errors !== null)
        }

        rx = {
            customer: customer[0], 
            tour: {}, 
            reservationDate: moment().add('4', 'd'),
            pax: 3,
            payment: {
                totalPrice: 100,
                status: PaymentStatus.PAID,
                payments: [{
                    price:100,
                    status: PaymentStatus.PAID
                }]
            }
        }
        try {
            await ReservationService.save(rx);
        } catch (error) {
            console.log(error);
            assert (error.errors !== null)
        }

        
    });

    it('When update reservation then reservation datas must be changed',  async ()  => {
        
        const  rx = await reservationModel.find({})
                                        /*.populate({path: 'payment',select: 'status'})
                                        .populate({path: 'payment', select: 'totalPrice'})
                                        .populate({path: 'payment', select: 'payemnts'})*/
                                        .limit(1).exec();
        const newTour = await TourModel.find({}).limit(1).exec();
         
        const newPayment = {
            price: 100,
            status: PaymentStatus.PAID
        }
        
        const totalPayment = rx[0].payment.payments.length ;

        const newRx = {
            tour: newTour[0],
            reservationDate: moment.now(),
            payment : {
                payments: [newPayment]
            }
        }

        await ReservationService.update(rx[0]._id, newRx);    
        const rxUpdated = await ReservationModel.findById(rx[0]._id).populate('tour payments').exec();
       
        assert(rxUpdated.tour.name === newRx.tour.name);
        assert((totalPayment +1) === rxUpdated.payment.payments.length);
    });
/*
    it('When delete reservation then reservation must me removed',  async ()  => {
        
        const  total = await reservationModel.find({}).estimatedDocumentCount();
        const  rx = await reservationModel.find({}).limit(1).exec();

        await ReservationService.remove(rx._id);
        
        const newTotal = await reservationModel.find({}).estimatedDocumentCount();
        assert((total - 1), newTotal);
    });*/

});    