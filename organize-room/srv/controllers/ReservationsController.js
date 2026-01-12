const ReservationsService = require('../services/ReservationsService');
const reservationsService = new ReservationsService();

module.exports = {
    async createReservation(req) {
        return await reservationsService.createReservation(req);
    }, 
    
    async updateReservation(req) { 
        return await reservationsService.updateReservation(req.data); 
    }, 
    
    async deleteReservation(req) { 
        return await reservationsService.deleteReservation(req.data); 
    }
};
