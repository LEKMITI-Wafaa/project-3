const mongoose = require("mongoose");

const { Schema, model } = mongoose;
const serviceSchema = new Schema(
  {
    name: String,
    phone: String,
    email: {
      type: String,
      match: /.*@.*\..*/
    }
  }
)

module.exports = model("Service", serviceSchema);
