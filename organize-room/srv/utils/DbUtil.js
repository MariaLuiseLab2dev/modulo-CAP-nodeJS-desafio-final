const cds = require('@sap/cds');

let db; 

async function getDb() {
    if (!db) {
        db = await cds.connect.to('db');
    }
    return db;
}

async function getEntities() {
    const db = await getDb();
    return {
        Users: db.entities['UsersService.Users'],
        Reservations: db.entities['ReservationsService.Reservations'],
        ReservationRules: db.entities['ReservationsService.ReservationRules']
    };
}

module.exports = { getEntities };
