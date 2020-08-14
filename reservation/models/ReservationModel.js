const mongoose = require('mongoose');
const PaymentStatus = require('./PaymentStatus');
const PaymentMethod = require('./PaymentMethod');
const { min } = require('moment');

const paymentDetailSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    price: {
        type:Number,
        default:0.0,
        required: true,
        min:1
    },
    paymentMethod: {
        type: String,
        enum: [PaymentMethod.OPENPAY, PaymentMethod.PAYPAL],
        required: true
    },
    status: {
        type: String,
        enum: [PaymentStatus.PENDING, PaymentStatus.PAID],
        required: true
    }
});

const paymentSchema = mongoose.Schema({
    totalPrice: {
        type:Number,
        default:0.0,
        required: true ,
        min:1
    },
    status: {
        type: String,
        enum: [PaymentStatus.PAID, PaymentStatus.PENDING]
    },
    payments: [paymentDetailSchema]
});


const reservationModel = mongoose.Schema({

    customer: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer',
        required: true
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tour',
        required: true
    },
    reservationDate: {
        type: Date,
        required: true
    },
    pax:{
        type:Number,
        required: true,
        min:1
    },
    payment: paymentSchema,

    createdAt: {
        type: Date,
        default: Date.now()
    },
});

module.exports = mongoose.model('Reservation', reservationModel)