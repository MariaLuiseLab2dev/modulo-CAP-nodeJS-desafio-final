

using { cuid } from '@sap/cds/common';

type organize.Position : String enum {
    Organizador;
    Administrador;
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
    position    : organize.Position;
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
    startTime       : Time;
    endTime         : Time;
    participants    : Integer;
    subject         : String;
    confidential    : Boolean;
    user            : Association to Users;
}

entity ReservationRules : cuid {
    allowedWeekDays  : array of String; // dias da semana
    allowedMonthDays : array of Integer; // dias do mês
    startTimeAllowed : Time;
    endTimeAllowed   : Time;
    allowedHolidays  : Boolean; // se true, habilita, se false não habilita
    maxParticipants   : Integer;
}