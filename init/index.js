const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const getCoordinates = require("../utils/geocode"); // 🔥 add this

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("connected to db"))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const updatedData = initdata.data.map(obj => ({
    ...obj,
    owner: "69ca6e53d801cfc69f34c0d0",
    geometry: {
      type: "Point",
      coordinates: [77, 28] // dummy coords (Delhi)
    }
  }));

  await Listing.insertMany(updatedData);

  console.log("✅ Data inserted (dummy coordinates)");
};

initDB();