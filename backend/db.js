const mongoose = require("mongoose");

const mongooseURI = "mongodb://0.0.0.0:27017/inotebook";

async function connectToMongo() {
  await mongoose
    .connect(mongooseURI)
    .then(() => console.log("Connected to Mongo Successfully"))
    .catch((err) => console.log(err));
}

module.exports = connectToMongo;
