const usersService = require('../services/UsersServices');

module.exports = {
    async createUser(req, entities) {
        return await usersService.createUser(req, entities);
    },

    async updateUser(req, entities) {
        return await usersService.updateUser(req, entities);
    },

    async deleteUser(req, entities) {
        return await usersService.deleteUser(req, entities);
    }
};
