// La ligne suivante ne doit être utilisée qu'une seule fois et au tout début du projet. De préférence dans index.js
require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`

const express = require("express");
const app = express();
const formidable = require("express-formidable");
const mongoose = require("mongoose");
//Cette ligne fait bénifier de CORS à toutes les requêtes de notre serveur
const cors = require("cors");
app.use(cors());
const morgan = require("morgan");
app.use(formidable());
app.use(morgan("dev"));
const port = 3000;

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

app.get("/", (req, res) => {
  res.status(400).json({ message: "Bienvenue sur l'API de (almost) Vinted" });
});

app.all("*", (req, res) => {
  res.status(400).json({ message: "Page not found" });
});

// Utilisez le port défini dans le fichier .env
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
