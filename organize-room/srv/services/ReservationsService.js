const cds = require("@sap/cds");
const { getEntities } = require("../utils/DbUtil");
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');

class ReservationsService {
    async createReservation(data) {

        const { Users } = await getEntities();
        const reqdata = data.req.body;

        const user = await SELECT.one.from(Users).where({ ID: reqdata.user_ID });

        if (!user) throw new Error("Usuário não existe");

        const { Position } = require("#cds-models/organize");

        console.log(user.position);

        if (user.position === Position.Administrador) {
            // ignora regras 
            return await this.insertReservation(reqdata);
        }


        if (user.position === Position.Organizador) {
            // segue as regras
            let validReservation = await this.validateReservation(reqdata);
            return await this.insertReservation(validReservation);
        }
    }


    // validar os dados da reserva
    async validateReservation(data) {
        // Conflito de reservas
        await this.validateConflict(data);

        // Dias permitidos
        await this.validateDays(data);

        //  Horários permitidos
        await this.validateHours(data);

        // Limite de participantes
        await this.validateParticipants(data);

        // Feriados
        await this.validateHolidays(data);

        return data; // passou em todas as validações
    }

    async validateConflict(data) {
        const { Reservations } = await getEntities();

        // converte horário para minutos
        const toMinutes = (time) => {
            const [h, m] = time.split(":").map(Number); // separa horas e minutos e transforma de String p/ numero
            return h * 60 + m;
        };

        // horários da nova reserva
        const newStart = toMinutes(data.startTime);
        const newEnd = toMinutes(data.endTime);

        console.log(newStart);
        console.log(newEnd);

        // busca todas as reservas do mesmo dia
        const reservations = await SELECT.from(Reservations).where({ date: data.date });

        for (const r of reservations) {
            // ignora a própria reserva no caso de update 
            if (data.ID && r.ID === data.ID) continue;
            
            const existingStart = toMinutes(r.startTime);
            const existingEnd = toMinutes(r.endTime);

            // verifica sobreposição
            // Se uma reserva começa antes da outra terminar e termina depois da outra começar
            if (newStart < existingEnd && newEnd > existingStart) {
                throw new Error("Já existe uma reserva nesse horário");
            }
        }
    }


    async validateDays(data) {
        const day = new Date(data.date).getDay();
        if (day === 0 || day === 6) {
            throw new Error("Reservas só são permitidas de segunda a sexta-feira");
        }
    }

    async validateHours(data) {
        const MIN_START = 0;             // 00:00
        const MAX_END = 23 * 60 + 30;  // 23:30

        const toMinutes = (time) => {
            const [h, m] = time.split(":").map(Number);
            return h * 60 + m;
        };

        const start = toMinutes(data.startTime);
        const end = toMinutes(data.endTime);

        if (start < MIN_START || end > MAX_END) {
            throw new Error("Horário fora do intervalo permitido (00:00 - 23:30)");
        }
        if (start >= end) {
            throw new Error("Horário inicial deve ser menor que o horário final");
        }
    }

    async validateParticipants(data) {
        const MAX_PARTICIPANTS = 80;
        if (data.participants > MAX_PARTICIPANTS) {
            throw new Error(`Número de participantes excede o limite de ${MAX_PARTICIPANTS}`);
        }
    }

    async getFeriados(ano) {
        const response = await executeHttpRequest(
            { destinationName: "BRASILAPI_FERIADOS" },
            { method: 'GET', url: `/${ano}` }
        );
        return response.data;
    }

    async validateHolidays(data) {
        const ano = new Date(data.date).getFullYear();
        console.log(ano);

        if (ano < 2026) {
            throw new Error("Escolha uma data a partir do ano de 2026");
        }

        const feriados = await this.getFeriados(ano);
        const feriadoDatas = feriados.map(f => f.date);

        if (feriadoDatas.includes(data.date)) {
            throw new Error("Não é possível reservar em feriados nacionais");
        }
    }


    // inserir os dados da resevra
    async insertReservation(data) {
        const { Reservations } = await getEntities();

        const newReservation = {
            ID: cds.utils.uuid(),
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            participants: data.participants,
            subject: data.subject,
            confidential: data.confidential,
            user_ID: data.user_ID
        };

        await INSERT.into(Reservations).entries(newReservation);

        return newReservation;
    }


    // UPDATE
    // TO-DO: VALIDAR SE TEM OUTRO
    //
    async updateReservation(data) {
        const { Reservations, Users } = await getEntities();

        const reservation = await SELECT.one.from(Reservations).where({ ID: data.ID });
        if (!reservation) throw new Error("Reserva não encontrada");

        const user = await SELECT.one.from(Users).where({ ID: data.user_ID });
        if (!user) throw new Error("Usuário não existe");

        // só criador pode editar
        if (reservation.user_ID !== data.user_ID) {
            throw new Error("Somente o criador pode editar esta reserva");
        }

        await this.validateConflict({ ...data, ID: data.ID }); 
        await this.validateDays(data); 
        await this.validateHours(data); 
        await this.validateParticipants(data); 
        await this.validateHolidays(data);

        await UPDATE(Reservations).set({
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            participants: data.participants,
            subject: data.subject,
            confidential: data.confidential
        }).where({ ID: data.ID });

        return { message: "Reserva atualizada com sucesso" };
    }

    

}


module.exports = ReservationsService;