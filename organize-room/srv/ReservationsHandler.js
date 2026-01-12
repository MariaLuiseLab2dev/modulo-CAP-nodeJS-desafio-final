const cds = require('@sap/cds');
const reservationsController = require('./controllers/ReservationsController');
const reservationRulesController = require('./controllers/ReservationRulesController');

class ReservationsHandler extends cds.ApplicationService {
    init() {
        const { Reservations } = this.entities;

        this.on('CREATE', Reservations, async (req) => {
            return await reservationsController.createReservation(req);
        });

        this.on("UPDATE", Reservations, async (req) => { 
            console.log(req.data.ID);
            return await reservationsController.updateReservation(req); 
        }); 
            
        this.on("DELETE", Reservations, async (req) => { 
            return await reservationsController.deleteReservation(req); 
        });

    }
}

module.exports = ReservationsHandler;
