const mongoose = require("mongoose");

const IDschema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  uploadedAt: { type: Date, default: Date.now }
});

const ID = mongoose.model("ID", IDschema);

module.exports = ID;
