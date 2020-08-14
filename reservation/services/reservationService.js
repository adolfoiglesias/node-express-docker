
const CustomerService = require('../services/customerService');
const moment = require('moment');
const ReservationModel = require('../models/ReservationModel');
const CustomerModel = require('../models/CustomerModel');
const TourService = require('../../tour/services/tourService');
const reservationModel = require('../models/ReservationModel');
const PaymentStatus = require('../models/PaymentStatus');

const { runInTransaction } = require('mongoose-transact-utils');
const ReservationException = require('../exceptions/reservationException');

const OpenPayReservation = require('./openpayService');
const PaymentMethod = require('../models/PaymentMethod');

const EmailService = require('./emailService');

    // ---------------------------------------------------------------- List reservations
    exports.findAll = () => {
        return ReservationModel.find({}).populate('customer').exec();
    }
    
    // ---------------------------------------------------------------- List reservations by customer
    exports.findAllByCustomer =  async (customerEmail) => {

        const customer = await CustomerModel.findOne({email: customerEmail}).exec();
        return reservationModel.find({customer}).exec();        
/*
        return reservationModel.find().populate({
            path: 'customer',
            match: {email : customerEmail},
            select: 'name email loginType'
        }).exec();
*/
    }

    // ---------------------------------------------------------------- Find Customer by Id
    exports.findById = (id) => {
        return reservationModel.findById(id).exec();
    }

    // ---------------------------------------------------------------- Create new reservation
    exports.save = async (reservation) => {

        // ---------------------------------------------------------------------- validate reservation date
        const invalidDate = moment().isAfter(reservation.reservationDate);    

        if(invalidDate){
            const ex = new ReservationException('error', 'Error', '');
            ex.addValidationError('reservationDate', 'invalidDate', 'Reservation date ust bew after current day');
            throw ex;
        }

        const session = await ReservationModel.startSession();

        return session.withTransaction(async ()=> {

            const result = await OpenPayReservation.pay(reservation);

            if(result){
                
                reservation.payment = {
                    totalPrice: reservation.payment.totalPrice,
                    status: PaymentStatus.PAID,
                    payments: [{
                        status: PaymentStatus.PAID,
                        price: reservation.payment.totalPrice,
                        paymentMethod: PaymentMethod.OPENPAY
                    }]
                }
                EmailService.sendRxRejected(reservation);
            
            }else {
                
                reservation.payment = {
                    totalPrice: reservation.payment.totalPrice,
                    status: PaymentStatus.PENDING,
                    payments: [{
                        status: PaymentStatus.PENDING,
                        price: reservation.payment.totalPrice,
                        paymentMethod: PaymentMethod.OPENPAY
                    }]
                }
                EmailService.sendRxConfirmation(reservation);
            }

            const rx = new ReservationModel(reservation);
            return rx.save({session});
        });
    }

    // ---------------------------------------------------------------- Update reservation
    exports.update = async (id, reservation) => {

        return runInTransaction( async (session) => {

            const rx = await reservationModel.findById(id).session(session).exec();

            rx.tour = reservation.tour ? reservation.tour : rx.tour;
            rx.reservationDate = reservation.reservationDate ? reservation.reservationDate : rx.reservationDate;
            rx.pax = reservation.pax ? reservation.pax : rx.pax;

            rx.payment = {
                status: rx.payment.status,
                payments: [...rx.payment.payments, reservation.payment.payments[0]]
            },

            rx.payment.payments.forEach(element => {
                rx.payment.totalPrice+=element.price;
            });
            
            rx.customer = reservation.customer ? reservation.customer : rx.customer

            return reservationModel.findByIdAndUpdate(id, rx).session(session).exec();
        });        
    }

    // ---------------------------------------------------------------- remove reservation
    exports.remove = (id) => {
        return reservationModel.findOneAndDelete(id);
    }

    //  -------------------------------------------------------------- init reservation data demo
    exports.init = async () => {
        const total = await ReservationModel.find().estimatedDocumentCount();
        
        console.log('ReservationService.init...');

        console.log('Total de Rx ' + total)

        if(total === 0){
            await CustomerService.init();
            await TourService.init();
            const customers =  await CustomerModel.find({}).exec();
            const tours = await TourService.findAll();

            const customer1Email  = customers.filter(c => c.email === 'customer1@gmail.com');
            const customer2Email  = customers.filter(c => c.email === 'customer2@gmail.com');

            const rx1 = {
                customer: customer1Email[0],
                reservationDate: moment().add(1, 'd'),
                tour: tours[0],
                pax: 2,
                payment: {
                    status: PaymentStatus.PAID,
                    payments: [{
                        price: 400,
                        status: PaymentStatus.PAID,
                        paymentMethod: PaymentMethod.OPENPAY
                    }],
                    totalPrice: 400
                }
            }

            const rx2 = {
                customer: customer1Email[0],
                reservationDate: moment().add(1, 'd'),
                tour: tours[1],
                pax: 3,
                payment: {
                    status: PaymentStatus.PAID,
                    payments: [{
                        price: 300,
                        status: PaymentStatus.PAID,
                        paymentMethod: PaymentMethod.OPENPAY
                    }],
                    totalPrice: 300
                }
            }

            const rx3 = {
                customer: customer2Email[0],
                reservationDate: moment().add(2, 'd'),
                tour: tours[0],
                pax: 2,
                payment: {
                    status: PaymentStatus.PAID,
                    payments: [{
                        price: 150,
                        status: PaymentStatus.PAID,
                        paymentMethod: PaymentMethod.OPENPAY
                    }],
                    totalPrice: 150
                }
            }
            const rx4 = {
                customer: customer2Email[0],
                reservationDate: moment().add(2, 'd'),
                tour: tours[1],
                pax: 4,
                payment: {
                    status: PaymentStatus.PAID,
                    payments: [{
                        price: 450,
                        status: PaymentStatus.PAID,
                        paymentMethod: PaymentMethod.OPENPAY
                    }],
                    totalPrice: 450
                }
            }

            const session = await ReservationModel.startSession();

            return session.withTransaction(()=> {
                return ReservationModel.insertMany([rx1,rx2, rx3, rx4], {session});
            });
/*
            return runInTransaction( async (session) => {
                return ReservationModel.insertMany([rx1,rx2, rx3, rx4]);
            });
            */
        }
    }


