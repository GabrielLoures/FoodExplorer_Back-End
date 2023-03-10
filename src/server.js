require("express-async-errors")
require("dotenv/config")

const express = require('express')
const cors = require('cors')
const path = require('path')
const AppError = require("./utils/AppError")
const uploadConfig = require("./configs/upload")

const database = require("./database/sqlite")

const routes = require('./routes')

database();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER))
app.use(express.static(path.resolve(__dirname, 'assets')))

app.use(routes);

app.use((error, req, res, next) => {
  if(error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message
    })
  }

  console.error(error);

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error"
  })
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})




