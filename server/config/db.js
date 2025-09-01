const mongoose = require('mongoose');
const dotenv = require('dotenv');  // Charger dotenv

dotenv.config();  // Charger les variables d'environnement depuis .env

// Connexion à MongoDB en utilisant la base de données `newsletter`
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsletter')
  .then(() => {
    console.log('MongoDB connecté à la base de données newsletter');
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB:', err);
    process.exit(1);  // Quitter le processus si la connexion échoue
  });
