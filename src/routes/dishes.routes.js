const { Router } = require("express")

const DishesController = require("../controllers/DishesController")

const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const ensureAuthenticatedAdmin = require("../middlewares/ensureAuthenticatedAdmin")

const dishesRouter = Router();
const dishesController = new DishesController();

dishesRouter.use(ensureAuthenticated)

dishesRouter.post("/", ensureAuthenticatedAdmin, dishesController.create)
dishesRouter.get("/", dishesController.index)
dishesRouter.get("/:id", dishesController.show)
dishesRouter.delete("/:id", ensureAuthenticatedAdmin, dishesController.delete)
dishesRouter.put("/:id", ensureAuthenticatedAdmin, dishesController.update)

module.exports = dishesRouter;