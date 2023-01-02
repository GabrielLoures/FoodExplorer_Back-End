const { Router } = require("express")
const multer = require("multer")
const uploadConfig = require("../configs/upload")

const DishesController = require("../controllers/DishesController")
const DishesImageController = require("../controllers/DishesImageController")

const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const ensureAuthenticatedAdmin = require("../middlewares/ensureAuthenticatedAdmin")

const dishesRouter = Router();
const upload = multer(uploadConfig.MULTER)

const dishesController = new DishesController();
const dishesImageController = new DishesImageController()

dishesRouter.use(ensureAuthenticated)

dishesRouter.post("/", ensureAuthenticatedAdmin, upload.single("image"), dishesController.create)
dishesRouter.patch('/image/:id', upload.single('image'), dishesImageController.update)
dishesRouter.get("/", dishesController.index)
dishesRouter.get("/:id", dishesController.show)
dishesRouter.delete("/:id", ensureAuthenticatedAdmin, dishesController.delete)
dishesRouter.put("/:id", ensureAuthenticatedAdmin, upload.single("image"), dishesController.update)

module.exports = dishesRouter;