const cds = require("@sap/cds");

class UsersService {

    async createUser(req, { Users }) {
        const data = req.data;
        
        // regra: e-mail único
        const existing = await SELECT.one.from(Users).where({ email: data.email });
        if (existing) throw new Error(`O e-mail ${data.email} já está em uso.`);

        const newUser = {
            ID: cds.utils.uuid(),
            name: data.name,
            email: data.email,
            position: data.position
        };

        await INSERT.into(Users).entries(newUser);
        return newUser;
    }

    async updateUser(data, { Users }) {
        const user = await SELECT.one.from(Users).where({ ID: data.ID });
        if (!user) throw new Error("Usuário não encontrado");

        await UPDATE(this.Users).set(data).where({ ID: data.ID });
        return { message: "Usuário atualizado com sucesso" };
    }

    async deleteUser(id, { Users }) {
        const user = await SELECT.one.from(Users).where({ ID: id });
        if (!user) throw new Error("Usuário não encontrado");

        await DELETE.from(this.Users).where({ ID: id });
        return { message: "Usuário deletado com sucesso" };
    }
}

module.exports = new UsersService();