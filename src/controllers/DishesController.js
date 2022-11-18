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

  async show(req, res) {

    const { id } = req.params

    const dish = await knex("dishes").where({ id }).first()
    const ingredients = await knex("ingredients").where({ dish_id: id }).orderBy("name")

    return res.json({
      ...dish,
      ingredients
    })
  }

  async delete(req, res) {

    const { id } = req.params

    await knex("dishes").where({ id }).delete()

    return res.json()
  }

  async index(req, res) {

    const { title, ingredients } = req.query

    let dishes;

    if(ingredients) {

      const filterIngredients = ingredients.split(",").map(ingredient => ingredient.trim())

      dishes = await knex("ingredients")
        .select([
          "dishes.id",
          "dishes.title",
          "dishes.description",
          "dishes.category",
          "dishes.price",
          "dishes.image"
        ])
        .whereLike("dishes.title", `%${title}%`)
        .whereIn("name", filterIngredients)
        .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
        .orderBy("dishes.title")

    } else {

      dishes = await knex("dishes")
        .whereLike("title", `%${title}%`)
        .orderBy("title")

    }

    const dishesIngredients = await knex("ingredients")

    const dishesWithIngredients = dishes.map(dish => {
      const dishIngredients = dishesIngredients.filter(ingredient => ingredient.dish_id === dish.id)

      return {
        ...dish,
        ingredients: dishIngredients
      }
    })

    return res.status(200).json(dishesWithIngredients)
  }

}

module.exports = DishesController;