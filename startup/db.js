const mongoose = require("mongoose");
const winston = require("winston");
require("dotenv").config();

module.exports = function () {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => winston.info("Connected to MongoDB..."));
};
