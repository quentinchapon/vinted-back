const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: { type: String, require: true },
  product_description: { type: String, require: true },
  product_price: { type: String, require: true },
  product_details: Array,
  product_image: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    require: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Offer;
