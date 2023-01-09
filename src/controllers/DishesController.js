const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")

function ingredientImg(name) {
  switch (name) {
    case 'alface':
      return 'alface.png'
    case 'ameixa':
      return 'ameixa.png'
    case 'amêndoas':
      return 'amendoas.png'
    case 'aniz':
      return 'aniz.png'
    case 'café':
      return 'cafe.png'
    case 'camarão':
      return 'camarao.png'
    case 'canela':
      return 'canela.png'
    case 'damasco':
      return 'damasco.png'
    case 'farinha':
      return 'farinha.png'
    case 'gelo':
      return 'gelo.png'
    case 'limão':
      return 'limao.png'
    case 'maçã':
      return 'maca.png'
    case 'maracujá':
      return 'maracuja.png'
    case 'massa':
      return 'massa.png'
    case 'pão naan':
      return 'naan.png'
    case 'ovo':
      return 'ovo.png'
    case 'pão':
      return 'pao.png'
    case 'pepino':
      return 'pepino.png'
    case 'pêssego':
      return 'pessego.png'
    case 'pesto':
      return 'pesto.png'
    case 'presunto':
      return 'presunto.png'
    case 'rabanete':
      return 'rabanete.png'
    case 'rúcula':
      return 'rucula.png'
    case 'tomate':
      return 'tomate.png'
    case 'whiskey':
      return 'whiskey.png'
    default:
      return 'default'
  }
}

class DishesController {

  async create(req, res) {
    
    const { title, description, category, price, ingredients } = req.body
    const imageFilename = req.file.filename

    const diskStorage = new DiskStorage()

    const filename = await diskStorage.saveFile(imageFilename)

    if (!title || !price || !description || !category || !filename) {
      throw new AppError('Por favor, preencha todos os campos para efetuar o cadastro')
    }

    const dish_id = await knex("dishes").insert({
      title,
      description,
      category,
      price,
      image: filename
    })

    const oneIngredient = typeof(ingredients) === 'string'

    let ingredientsInsert

    if (oneIngredient) {
      ingredientsInsert = {
        dish_id,
        image: ingredientImg(ingredients),
        name: ingredients
      }
    } else {
      
        ingredientsInsert = ingredients.map(ingredient => {
        
        return {
          dish_id,
          image: ingredientImg(ingredient),
          name: ingredient
        }
    
      })
    }
    

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

    if(dish.image) {
      await diskStorage.deleteFile(dish.image)
    }

    const filename = await diskStorage.saveFile(image)

    dish.title = title ?? dish.title
    dish.description = description ?? dish.description
    dish.category = category ?? dish.category
    dish.price = price ?? dish.price
    dish.image = filename
    

    const insertIngredients = ingredients.map(ingredient =>({
      name: ingredient,
      image: ingredientImg(ingredient),
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