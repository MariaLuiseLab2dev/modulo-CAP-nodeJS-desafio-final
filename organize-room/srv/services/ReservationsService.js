const cds = require("@sap/cds");
const { getEntities } = require("../utils/DbUtil");
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const nodemailer = require("nodemailer");


class ReservationsService {
    _transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "brittomarialuise@gmail.com",
            pass: "vonv widh enqd tehb"
        }
    });

    _roleStrategies = {
        Administrador: async (reqdata) => {
            return await this.insertReservation(reqdata);
        },
 
        Organizador: async (reqdata) => {
            let validReservation = await this.validateReservation(reqdata);
            return await this.insertReservation(validReservation);
        }
    };

    async _reservationRulesConnect() {
        const { ReservationRules } = await getEntities();
        const rules = await SELECT.one.from(ReservationRules);
        if (!rules) throw new Error("Nenhuma regra configurada");
        return rules;
    }

    async _formatarDataCompleta(dateStr, startTime, endTime) { 
        const date = new Date(dateStr);
        
        // formato dd/MM/yyyy 
        const dataFormatada = new Intl.DateTimeFormat("pt-BR", 
            { 
                day: "2-digit", 
                month: "2-digit", 
                year: "numeric" 
            }).format(date); 
            
            // dia da semana 
            const diaSemana = new Intl.DateTimeFormat("pt-BR", 
                { weekday: "long" }).format(date); 
        
            return `${dataFormatada} (${diaSemana}) das ${startTime} às ${endTime}`; 
        }

    async sendCanceledReservationToEmail(reservation, cancelledBy) { // criar uma função pra formatar a data
        let dataCompleta = await this._formatarDataCompleta(reservation.date, reservation.startTime, reservation.endTime);
        try {
            await this._transporter.sendMail({
            from: '"Organize Room" <brittomarialuise@gmail.com>',
            to: reservation.userEmail,
            subject: "Reunião cancelada",
            text: `A reunião "${reservation.subject}" marcada para ${dataCompleta} foi cancelada por ${cancelledBy.name} (${cancelledBy.email}).`,
            html: `<p>A reunião <b>${reservation.subject}</b> marcada para <b>${dataCompleta}</b> foi cancelada por <b>${cancelledBy.name}</b> (${cancelledBy.email}).</p>`
        });
        console.log("E-mail de cancelamento enviado com sucesso!");
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        }
    }

    async createReservation(data) {

        const { Users } = await getEntities();
        const reqdata = data.req.body;

        const user = await SELECT.one.from(Users).where({ ID: reqdata.user_ID });
        if (!user) throw new Error("Usuário não existe");

        const strategy = this._roleStrategies[user.position];
        if(!strategy) throw new Error("Cargo não suportado");
        
        return await strategy(reqdata); 
    }


    // validar os dados da reserva
    async validateReservation(data, id = null) {

        // Conflito de reservas
        await this.validateConflict({ ...data, ID: id });

        // Dias da semana permitidos
        await this.validateDaysWeek(data);

        // Dias do mês permitidos
        await this.validateDaysMonth(data);

        //  Horários permitidos
        await this.validateHours(data);

        // Limite de participantes
        await this.validateParticipants(data);

        // Feriados
        await this.validateHolidays(data);

        return data; // passou em todas as validações
    }

    _toMinutes(time) {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    }

    async validateConflict(data) {
        const { Reservations } = await getEntities();

        const conflicts = await SELECT.from(Reservations)
            .where({ date : data.date })
            // o tempo de inicio for menor que o tempo de fim
            .and(`startTime < '${data.endTime}'`)
            // o tempo de fim for maior que o tempo de inicio
            .and(`endTime > '${data.startTime}'`)
            // se tiver data.ID ele tira o próprio, senão passa nada
            .and(data.ID ? { ID: { '!=': data.ID } } : {}
        );

        if (conflicts.length > 0) { 
            throw new Error("Já existe uma reserva nesse horário"); 
        }
    }


    async validateDaysWeek(data) {
        const rules = this._reservationRulesConnect();

        // pega o dia da semana da reserva 
        let dayOfWeekNum = new Date(data.date).getDay();

        const dayNames = [ 
            "Domingo", 
            "Segunda-feira", 
            "Terça-feira", 
            "Quarta-feira", 
            "Quinta-feira", 
            "Sexta-feira", 
            "Sábado" 
        ]; 
        
        const dayOfWeekName = dayNames[dayOfWeekNum]; 
        console.log(`\nDia da semana: ${dayOfWeekNum} (${dayOfWeekName})`);
        
        if (!rules.allowedWeekDays.includes(dayOfWeekNum)) { 
            throw new Error(`Dia da semana ${dayOfWeekName} não permitido para reservas`); 
        }
    }

    async validateHours(data) {
       const rules = await this._reservationRulesConnect();

        const start = this._toMinutes(data.startTime);
        const end = this._toMinutes(data.endTime);

        const minStart =  this._toMinutes(rules.startTimeAllowed); 
        const maxEnd =  this._toMinutes(rules.endTimeAllowed); 

        if (start < minStart || end > maxEnd) {
            throw new Error(`Horário fora do intervalo permitido (${rules.startTimeAllowed} - ${rules.endTimeAllowed})`);
        }

        if (start >= end) {
            throw new Error("Horário inicial deve ser menor que o horário final");
        }
    }

    // VALIDAR OS DIAS DO MÊS
    async validateDaysMonth(data) {
        const rules = await this._reservationRulesConnect();

        const dayOfMonth = new Date(data.date).getDate();
        console.log(dayOfMonth);

        // verifica se está na lista permitida 
        if (!rules.allowedMonthDays.includes(dayOfMonth)) { 
            throw new Error(`Dia ${dayOfMonth} não permitido para reservas`); 
        }

    }


    async validateParticipants(data) {
       const rules = await this._reservationRulesConnect();

        if (data.participants > rules.maxParticipants) {
            throw new Error(`Número de participantes excede o limite de ${rules.maxParticipants}`);
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
        const rules = await this._reservationRulesConnect();
        
        const ano = new Date(data.date).getFullYear(); 
        if (ano < 2026) { 
            throw new Error("Escolha uma data a partir do ano de 2026"); 
        } 
        
        const allowedHolidays = rules.allowedHolidays === true || rules.allowedHolidays === "true";

        if (!allowedHolidays) { 
            const feriados = await this.getFeriados(ano); 
            const feriadoDatas = feriados.map(f => f.date); 
            if (feriadoDatas.includes(data.date)) { 
                throw new Error("Não é possível reservar em feriados nacionais"); 
            } 
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

    async readAllReservations() { 
        const { Reservations } = await getEntities();  
        return SELECT.from(Reservations); 
    } 

    async readReservationById(id) { 
        const { Reservations } = await getEntities(); 
        return await SELECT.one.from(Reservations).where({ ID: id }); 
    }

    async updateReservation(data) {
        const { Reservations, Users } = await getEntities();

        const reservation = await SELECT.one.from(Reservations).where({ ID: data.ID });
        if (!reservation) throw new Error("Reserva não encontrada");

        // usa o user_ID da reserva se não vier no payload 
        const userId = data.user_ID || reservation.user_ID;

        const user = await SELECT.one.from(Users).where({ ID: userId });
        if (!user) throw new Error("Usuário não existe");

        
        // só criador pode editar
        if (reservation.user_ID !== userId) {
            throw new Error("Somente o criador pode editar esta reserva");
        }

       await this.validateReservation(data, data.ID);

       const { ID, user_ID, ...updateData } = data;

        await UPDATE(Reservations).set({ ...updateData }).where({ ID: data.ID });

        return await SELECT.one.from(Reservations).where({ ID: data.ID });
    }

    async deleteReservation(id) {
        const { Reservations, Users } = await getEntities();
        const reservation = await SELECT.one.from(Reservations).where({ ID: id });
        if (!reservation) throw new Error("Reserva não encontrada");

        await DELETE.from(Reservations).where({ ID: id });

        const organizer = await SELECT.one.from(Users).where({ ID: reservation.user_ID });

        // console.log("\nORGANIZADOR: " +organizer.name);

        await this.sendCanceledReservationToEmail({ ...reservation, userEmail: organizer.email }, { name: organizer.name, email: organizer.email});

        return { message: "Reserva deletada com sucesso" };
    }
}


module.exports = ReservationsService;