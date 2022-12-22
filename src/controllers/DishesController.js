const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")

class DishesController {

  async create(req, res) {

    const { title, description, category, price, ingredients } = req.body

    const diskStorage = new DiskStorage()

    const dishFilename = req.file.filename
    const filename = await diskStorage.saveFile(dishFilename)

    const dish_id = await knex("dishes").insert({
      title,
      description,
      category,
      price,
      image: filename
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

  async update(req, res) {

    const { title, description, category, price, ingredients } = req.body
    const { id } = req.params
    const image = req.file.filename

    const diskStorage = new DiskStorage()

    const dish = await knex("dishes").where({ id }).first()

    if(!dish) {
      throw new AppError("Esse prato não está cadastrado!")
    }

    if(dish.image) {
      await diskStorage.deleteFile(dish.image)
    }

    const filename = await diskStorage.saveFile(image)

    dish.title = title ?? dish.title
    dish.description = description ?? dish.description
    dish.category = category ?? dish.category
    dish.price = price ?? dish.price
    dish.image = filename
    

    const insertIngredients = ingredients.map(name =>({
      name,
      dish_id: dish.id
    }))

    await knex("dishes").where({ id }).update(dish)
    await knex("dishes").where({ id }).update("updated_at", knex.fn.now())

    await knex("ingredients").where({dish_id: id}).delete()
    await knex("ingredients").where({dish_id: id}).insert(insertIngredients)

    return res.status(201).json('Prato atualizado com sucesso!')

  }

}

module.exports = DishesController;