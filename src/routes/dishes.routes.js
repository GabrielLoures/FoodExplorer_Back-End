const { Router } = require("express")

const DishesController = require("../controllers/DishesController")

const dishesRouter = Router();
const dishesController = new DishesController();

dishesRouter.post("/", dishesController.create)
dishesRouter.get("/", dishesController.index)
dishesRouter.get("/:id", dishesController.show)
dishesRouter.delete("/:id", dishesController.delete)

module.exports = dishesRouter;