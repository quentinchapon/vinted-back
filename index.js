require("dotenv").config();
const express = require("express");
const app = express();
const formidable = require("express-formidable");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
const morgan = require("morgan");
app.use(formidable());
app.use(morgan("dev"));
const port = 4000;

// Import des routes
const usersRoutes = require("./routes/user");
app.use(usersRoutes);
const offersRoutes = require("./routes/offer");
app.use(offersRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Route de paiement avec STRIPE
app.post("/payment", async (req, res) => {
  try {
    const response = await stripe.charges.create({
      amount: req.fields.price,
      currency: "eur",
      description: req.fields.title,
      source: req.fields.stripeToken,
    });
    console.log("La réponse de Stripe ====> ", response);
    if (response.status === "succeeded") {
      res.status(200).json({ message: "Paiement validé" });
    } else {
      res.status(400).json({ message: "An error occured" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Racine

app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenue sur l'API de (almost) Vinted" });
});

// Toutes les routes

app.all("*", (req, res) => {
  res.status(400).json({ message: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
