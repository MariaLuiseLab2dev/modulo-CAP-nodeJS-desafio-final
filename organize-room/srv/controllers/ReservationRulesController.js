const ReservationRulesService = require("../services/ReservationRulesService");
const reservationRulesService = new ReservationRulesService();

module.exports = {
    async createRule(req) {
        return await reservationRulesService.createRule(req.data);
    },

    async readRules(req) {
        if (req.data.ID) {
            return await reservationRulesService.readRuleById(req.data.ID);
        }
        return await reservationRulesService.readAllRules();
    },

    async updateRule(req) {
        return await reservationRulesService.updateRule(req.data);
    },

    async deleteRule(req) {
        return await reservationRulesService.deleteRule(req.data.ID);
    }

};