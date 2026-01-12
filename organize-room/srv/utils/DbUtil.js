const cds = require('@sap/cds');

let _db; 

async function _getDb() {
    if (!_db) {
        _db = await cds.connect.to('db');
    }
    return _db;
}

async function getEntities() {
    const db = await _getDb();
    return {
        Users: db.entities['UsersService.Users'],
        Reservations: db.entities['ReservationsService.Reservations'],
        ReservationRules: db.entities['ReservationsService.ReservationRules']
    };
}

module.exports = { getEntities };
