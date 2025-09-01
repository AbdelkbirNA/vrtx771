const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes"); 
const profilRoute = require("./routes/profilRoute"); 
const updatroute = require("./routes/updateRoutes"); 
const planteRoutes = require("./routes/planteRoutes");
const geminiRoute = require("./routes/geminiRoute");
const path = require("path");
const contactRoutes = require('./routes/contactRoutes')
const favoriteRoutes = require("./routes/favoriteRoutes");

const multer = require("multer");
const plantnetRoutes = require('./routes/plantnetRoutes'); 
// ou selon le chemin correct vers ton fichier de routes

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads/users"); // dossier où seront stockées les images
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.get("/", (req, res) => {
  res.send("hi");
});

app.use("/api/gemini", geminiRoute);
app.use("/api", authRoutes); 
app.use("/api/", profilRoute);
app.use("/api/", updatroute);
app.use("/api/", planteRoutes);
app.use("/api/plantnet", plantnetRoutes);
app.use('/api', contactRoutes)
app.use("/api/favorites", favoriteRoutes);
 
module.exports = app;
