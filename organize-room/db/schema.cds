using { cuid } from '@sap/cds/common';

type Position : String enum {
    Organizer;
    Administrator;
};

/**
 * O cadastro e edição dos campos de usuário são: 
 * Nome
 * E-mail
 * Cargo
 * Os cargos poderão ser "Organizador" e "Administrador".
 */
entity Users : cuid {
    name        : String;
    email       : String;
    position    : Position;
};

/**
 * Para o cadastrado e edição de reservas vai ter
 * a data
 * o horário de início
 * horário de fim
 * o número de participantes
 * motivo da reunião 
 * se é uma reunião confidencial
 * o usuário logado
 */
entity Reservations : cuid {
    date            : Date;
    startTime      : Time;
    endTime        : Time;
    participants    : Integer;
    subject         : String;
    confidential    : Boolean;
    user            : Association to Users;
}

entity ReservationRules : cuid {
    allowedWeekDays  : array of String;
    allowedMonthDays : array of Integer;
    startTimeAllowed : Time;
    endTimeAllowed   : Time;
    allowedHolidays  : String;
    maxParticipants   : Integer;
}