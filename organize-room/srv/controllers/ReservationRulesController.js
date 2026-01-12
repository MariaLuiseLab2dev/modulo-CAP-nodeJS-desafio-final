const ReservationRulesService = require("../services/ReservationRulesService");
const reservationRulesService = new ReservationRulesService();

module.exports = { async getRules(req) { 
    return await reservationRulesService.getRules(); 
} };