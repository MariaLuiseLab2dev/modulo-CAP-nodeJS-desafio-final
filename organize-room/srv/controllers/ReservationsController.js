const ReservationsService = require('../services/ReservationsService');
const reservationsService = new ReservationsService();

module.exports = {
    async createReservation(req) {
        return await reservationsService.createReservation(req);
    }, 
    
    async readReservations(req) { 
        // se veio ID, busca uma só; senão, todas 
        if (req.data.ID) { 
            return await reservationsService.readReservationById(req.data.ID); 
        } 
        return await reservationsService.readAllReservations(req.query); 
    },

    async updateReservation(req) { 
        return await reservationsService.updateReservation(req.data); 
    }, 
    
    async deleteReservation(req) { 
        return await reservationsService.deleteReservation(req.data.ID); 
    }
};
