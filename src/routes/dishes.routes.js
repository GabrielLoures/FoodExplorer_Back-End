const { Router } = require("express")

const DishesController = require("../controllers/DishesController")

const dishesRouter = Router();
const dishesController = new DishesController();

dishesRouter.post("/", dishesController.create)

module.exports = dishesRouter;