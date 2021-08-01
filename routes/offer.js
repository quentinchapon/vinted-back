const express = require("express");
const router = express();
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// import des models
const User = require("../models/User");
const Offer = require("../models/Offer");

// Route permettant de poster une nouvelle offre
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    //   console.log(req.user);

    // Destructuring
    const { title, description, price, condition, city, brand, size, color } =
      req.fields;

    // Déclarer newOffer
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          ÉTAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ],
      owner: req.user,
    });
    // Uploader l'image
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offer/${newOffer._id}`,
    });
    // Ajouter le resultat de l'upload dans newOffer
    newOffer.product_image = result;
    // Sauvgarder newOffer
    await newOffer.save();
    res.status(200).json("Merci, votre annonce est en ligne");
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

//Route de suppression de l'annonce
router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const offerToDelete = await Offer.findById(req.fields._id);

    if (offerToDelete) {
      await offerToDelete.remove();
      await cloudinary.api.delete_all_resources(`/offers/${offerToDelete._id}`);
      await cloudinary.api.delete_folder(`/offers/${offerToDelete._id}`);

      res.status(200).json({ message: "Your offer has been deleted" });
    } else {
      res.status(400).json({ message: "This offer does not exists" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Route permettant d'afficher l'ensemble des offres, filtrées
router.get("/offers", async (req, res) => {
  try {
    const filters = {};
    let sort = {};

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
      // ajoute une clé product_name à l'objet filters
      // cette clé a pour valeur new RegExp(req.query.title, "i")
      {
        product_name: new RegExp(req.query.title, "i");
      }
    }

    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = { $lte: Number(req.query.priceMax) };
      }
    }

    if (req.query.sort === "price-asc") {
      sort = { product_price: 1 };
    } else if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    }

    let page;
    const limit = Number(req.query.limit);

    if (Number(req.query.page < 1)) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    const offers = await Offer.find(filters)
      .populate({ path: "owner", select: "account" })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Offer.countDocuments(filters); // renvoyer le nombre de documents qui matchent avec filters

    res.status(200).json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route permettant d'afficher les offres avec comme params l'ID
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
