const knex = require("../database/knex")

class DishesController {

  async create(req, res) {

    const { title, description, category, price, ingredients } = req.body

    const dish_id = await knex("dishes").insert({
      title,
      description,
      category,
      price
    })

    const ingredientsInsert = ingredients.map(ingredient => {
      
      return {
        dish_id,
        name: ingredient
      }

    })

    await knex("ingredients").insert(ingredientsInsert)

    return res.status(201).json()
  }

}

module.exports = DishesController;