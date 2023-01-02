const knex = require('../database/knex');
const AppError = require("../utils/AppError");

const DiskStorage = require("../providers/DiskStorage");

class DishesImageController{
  async update(req, res){
    const dish_id = req.params.id
    const imageFilename = req.file.filename;

    const diskStorage = new DiskStorage();

    const dish = await knex("dishes").where({ id: dish_id }).first();

    if(!dish) {
      throw new AppError("O prato selecionado para fazer o upload da imagem não existe. Tente novamente.", 401);
    };

    if(dish.image){
      await diskStorage.deleteFile(dish.image);
    };

    const filename = await diskStorage.savefile(imageFilename);
    dish.image = filename;

    await knex("dishes").update(dish).where({ id: dish_id });

    return res.json(dish);
  }
}

module.exports = DishesImageController;