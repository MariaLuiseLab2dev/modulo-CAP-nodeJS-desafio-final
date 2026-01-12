const cds = require("@sap/cds");
const { getEntities } = require("../utils/DbUtil");

class ReservationRulesService {
    async createRule(data) {
        const { ReservationRules } = await getEntities();

        const newRule = {
            ID: cds.utils.uuid(),
            allowedWeekDays: data.allowedWeekDays,
            allowedMonthDays: data.allowedMonthDays,
            startTimeAllowed: data.startTimeAllowed,
            endTimeAllowed: data.endTimeAllowed,
            allowedHolidays: data.allowedHolidays,
            maxParticipants: data.maxParticipants
        };

        await INSERT.into(ReservationRules).entries(newRule);
        return newRule;
    }

    async readAllRules() {
        const { ReservationRules } = await getEntities();
        return await SELECT.from(ReservationRules);
    }

    async readRuleById(id) {
        const { ReservationRules } = await getEntities();
        return await SELECT.one.from(ReservationRules).where({ ID: id });
    }

    async updateRule(data) {
        const { ReservationRules } = await getEntities();

        const rule = await SELECT.one.from(ReservationRules).where({ ID: data.ID });
        if (!rule) throw new Error("Regra não encontrada");

        await UPDATE(ReservationRules).set({
            allowedWeekDays: data.allowedWeekDays,
            allowedMonthDays: data.allowedMonthDays,
            startTimeAllowed: data.startTimeAllowed,
            endTimeAllowed: data.endTimeAllowed,
            allowedHolidays: data.allowedHolidays,
            maxParticipants: data.maxParticipants
        }).where({ ID: data.ID });

        return { message: "Regra atualizada com sucesso" };
    }

    async deleteRule(id) {
        const { ReservationRules } = await getEntities();

        const rule = await SELECT.one.from(ReservationRules).where({ ID: id });
        if (!rule) throw new Error("Regra não encontrada");

        await DELETE.from(ReservationRules).where({ ID: id });
        return { message: "Regra deletada com sucesso" };
    }
}

module.exports = ReservationRulesService;
