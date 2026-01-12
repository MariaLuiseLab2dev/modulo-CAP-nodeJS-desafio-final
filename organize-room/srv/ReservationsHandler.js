const cds = require('@sap/cds');
const reservationsController = require('./controllers/ReservationsController');
const reservationRulesController = require('./controllers/ReservationRulesController');

class ReservationsHandler extends cds.ApplicationService {
    init() {
        const { Reservations, ReservationRules } = this.entities;

        this.on('CREATE', Reservations, async (req) => {
            return await reservationsController.createReservation(req);
        });

        this.on("READ", Reservations, async (req) => {
           return await reservationsController.readReservations(req);
        });

        this.on("UPDATE", Reservations, async (req) => { 
            console.log(req.data.ID);
            return await reservationsController.updateReservation(req); 
        }); 
            
        this.on("DELETE", Reservations, async (req) => { 
            return await reservationsController.deleteReservation(req); 
        });

        this.on("CREATE", ReservationRules, async (req) => {
            return await reservationRulesController.createRule(req);
        }); 
        
        this.on("READ", ReservationRules, async (req) => {
            return await reservationRulesController.readRules(req);
        }); 
        
        this.on("UPDATE", ReservationRules, async (req) => {
            return await reservationRulesController.updateRule(req);
        }); 
        
        this.on("DELETE", ReservationRules, async (req) => { 
            return await reservationRulesController.deleteRule(req);
        });

    }
}

module.exports = ReservationsHandler;
