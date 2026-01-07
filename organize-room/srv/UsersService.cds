@path: '/users'
service UsersService {
    /**
     * Vai ter:
     * - Cadastro de usuários (CREATE)
     * - Atualização de usuários (UPDATE)
     * - Consulta de usuários (READ)
     * - Exclusão de usuários (DELETE)- apenas p/ administradores
     *
     * Regras:
     * - Apenas usuários com cargo "Administrador" podem criar, atualizar ou excluir outros usuários
     * - Usuários com cargo "Organizador" podem apenas consultar a lista de usuários
     * - O campo "email" deve ser único, não permitindo duplicidade
     * - O campo "position" segue cargos válidos definidos (Organizador, Administrador)
     */
    entity Users {
        key ID       : UUID;
            name     : String;
            email    : String;
            position : String;
    };
}
