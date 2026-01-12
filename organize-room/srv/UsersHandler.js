const cds = require('@sap/cds');
const usersController = require("./controllers/UsersControllers");

class UsersHandler extends cds.ApplicationService {
    init() {
        const { Users } = this.entities;

        
            this.on('CREATE', Users, async (req) => { 
                try { 
                    return await usersController.createUser(req, this.entities); 
                } catch (err) { 
                    return req.error(400, err.message); 
                } 
            }); 
            
            this.on('UPDATE', Users, async (req) => { 
                try { 
                    return await usersController.updateUser(req, this.entities); 
                } catch (err) { 
                    return req.error(400, err.message); 
                } 
            }); 
                
            this.on('DELETE', Users, async (req) => { 
                try { 
                    return await usersController.deleteUser(req, this.entities); 
                } catch (err) { 
                    return req.error(400, err.message); 
                } 
            });

        super.init();
    }
}

module.exports = UsersHandler;
