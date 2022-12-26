const { Router } = require("express")
const multer = require("multer")
const uploadConfig = require("../configs/upload")

const DishesController = require("../controllers/DishesController")

const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const ensureAuthenticatedAdmin = require("../middlewares/ensureAuthenticatedAdmin")

const dishesRouter = Router();
const upload = multer(uploadConfig.MULTER)

const dishesController = new DishesController();

dishesRouter.use(ensureAuthenticated)

dishesRouter.post("/", ensureAuthenticatedAdmin, upload.single("image"), dishesController.create)
dishesRouter.get("/", dishesController.index)
dishesRouter.get("/:id", dishesController.show)
dishesRouter.delete("/:id", ensureAuthenticatedAdmin, dishesController.delete)
dishesRouter.put("/:id", ensureAuthenticatedAdmin, upload.single("image"), dishesController.update)

module.exports = dishesRouter;