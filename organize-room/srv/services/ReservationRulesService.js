const { getEntities } = require("../utils/DbUtil");
const ReservationsService = require("./ReservationsService");

class ReservationRulesService {
    constructor() {
        this.reservationsService = new ReservationsService();
    }

    _generateSlots(startTime, endTime) {
        const slots = [];
        let [h, m] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);

        while (h < endH || (h === endH && m <= endM)) {
            slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
            m += 30;
            if (m === 60) {
                m = 0;
                h++;
            }
        }
        return slots;
    }

    async getRules(date) {
        const { ReservationRules, Reservations } = await getEntities();
        const rules = await SELECT.one.from(ReservationRules);

        console.log(rules);
        
        // 1. gera todos os horários possíveis
        const slots = this._generateSlots(rules.startTimeAllowed, rules.endTimeAllowed);

        // 2. aplica filtros (dias, feriados)
        await this.reservationsService.validateDays({ date });
        await this.reservationsService.validateHolidays({ date });

        // 3. remove horários já ocupados
        const reservations = await SELECT.from(Reservations).where({ date });
        const occupied = reservations.flatMap(r =>
            slots.filter(s => s >= r.startTime && s < r.endTime)
        );
        const available = slots.filter(s => !occupied.includes(s));

        return { slots: available, occupiedSlots: occupied };
    }

}


module.exports = ReservationRulesService;
