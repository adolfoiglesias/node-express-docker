
class  ReservationException extends Error {

    constructor(message){
        super(message);
        this.name = 'ReservationException';
        this.errors = {};
    }

    addValidationError(fieldName, code, message){
        this.errors[fieldName] = {code, message}
    }

    getErrors(){
        return this.errors;
    }
}

module.exports = ReservationException;