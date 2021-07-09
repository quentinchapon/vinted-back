// La ligne suivante ne doit être utilisée qu'une seule fois et au tout début du projet. De préférence dans index.js
require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`

mongoose.connect(process.env.MONGODB_URI); // Vous pourrez vous connecter à votre base de données, sans pour autant préciser les identifiants dans le fichier index.js

//Cette ligne fait bénifier de CORS à toutes les requêtes de notre serveur
app.use(cors());

const express = require("express");
const app = express();
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const morgan = require("morgan");
app.use(formidable());
app.use(morgan("dev"));
const port = 3000;

// Import des routes
const usersRoutes = require("./routes/user");
app.use(usersRoutes);
const offersRoutes = require("./routes/offer");
app.use(offersRoutes);

mongoose.connect("mongodb://localhost/vinted", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.all("*", (req, res) => {
  res.status(400).json({ message: "Page not found" });
});

// Utilisez le port défini dans le fichier .env
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
