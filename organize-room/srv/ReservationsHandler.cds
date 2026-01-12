using { Users } from '../db/schema';

@path: '/reservations'
service ReservationsService {
    /**
     * Vai ter:
     * - Cadastro de reservas (CREATE)
     * - Atualização de reservas (UPDATE), permitido apenas ao criador da reunião
     * - Cancelamento de reservas (DELETE), permitido ao criador ou a administradores
     * - Consulta de reservas (READ)
     *
     * Regras:
     * - Apenas usuários existentes podem criar reservas
     * - Usuários com cargo "Administrador" podem criar reservas ignorando todas as regras
     * - Usuários com cargo "Organizador" devem respeitar:
     *   - Dias da semana e dias do mês permitidos
     *   - Intervalo de horário permitido
     *   - Feriados permitidos
     *   - Limite máximo de participantes
     * - Não pode haver reservas conflitantes no mesmo dia e horário
     * - Apenas o criador pode editar sua reserva
     * - Cancelamento:
     *   - Criador pode cancelar sua própria reserva
     *   - Administrador pode cancelar qualquer reserva
     *   - Ao cancelar, deve ser disparado e-mail via SMTP informando quem cancelou
     */
    entity Reservations {
        key ID          : UUID;
        date            : Date;
        startTime       : Time;
        endTime         : Time;
        participants    : Integer;
        subject         : String;
        confidential    : Boolean;
        user            : Association to Users;
    };

    /**
     *   Consulta dos dias que pode fazer a reserva (READ em ReservationRules)
     *   quais dias, horários, feriados e limites de participantes estão liberados
     */
    entity ReservationRules {
        key ID              : UUID;
        allowedWeekDays     : array of String;   // dias da semana permitidos
        allowedMonthDays    : array of Integer;  // dias do mês permitidos
        startTimeAllowed    : Time;              // horário inicial permitido
        endTimeAllowed      : Time;              // horário final permitido
        allowedHolidays     : String;            // feriados liberados
        maxParticipants     : Integer;           // limite máximo de participantes
    };
}
