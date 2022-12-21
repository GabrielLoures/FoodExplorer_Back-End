const knex = require('../database/knex');
const AppError = require('../utils/AppError');

async function ensureAuthenticatedAdmin(req, res, next) {

  const user_id = req.user.id;

  const user = await knex("users").where({ id: user_id }).first();

  if (!user.isAdmin) {
    throw new AppError("Usuário não é administrador", 401)
  }

  next();
  
}

module.exports = ensureAuthenticatedAdmin;