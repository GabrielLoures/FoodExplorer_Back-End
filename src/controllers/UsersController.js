const AppError = require("../utils/AppError")
const knex = require("../database/knex")
const { hash } = require("bcryptjs")

class UsersController {

  async create(req, res) {
    const { name, email, password } = req.body

    const checkUserExists = await knex("users").where({ email }).first()

    if(checkUserExists) {
      throw new AppError("Este e-mail já está cadastrado.")
    }

    const hashPassword = await hash(password, 8)

    await knex("users").insert({ name, email, password: hashPassword })

    return res.status(201).json()

  }
}

module.exports = UsersController;