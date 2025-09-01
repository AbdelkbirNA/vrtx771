require('dotenv').config();  // Charger les variables d'environnement depuis .env
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios'); // Pour faire des requêtes HTTP
const Subscriber = require('./models/subscriber');  // Importer le modèle Subscriber
const Email = require('./models/Email');  // Importer le modèle Email pour les statistiques
const newsletterRoutes = require('./routes/newsletterRoutes');  // Route pour newsletter
const geminiRoutes = require('./routes/geminiRoutes'); // Route pour Gemini
const app = express();

app.use(express.json());  // Pour analyser le JSON dans les requêtes

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newsletter')
  .then(() => {
    console.log('MongoDB connecté à la base de données "newsletter"');
  })
  .catch((err) => {
    console.error('Erreur de connexion MongoDB:', err);
    process.exit(1); // Quitter le processus si la connexion échoue
  });

// Middleware CORS
app.use(cors());

// Routes de l'API
app.use('/api', newsletterRoutes);
app.use('/api/gemini', geminiRoutes);

// Route pour l'abonnement
app.post('/api/subscribe', async (req, res) => {
  const { email, preferences } = req.body;

  try {
    // Vérifie si l'email est déjà abonné
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Cet email est déjà abonné.' });
    }

    // Crée un nouvel abonné
    const newSubscriber = new Subscriber({ email, preferences });
    await newSubscriber.save();

    res.status(200).json({ message: 'Abonnement réussi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'abonnement.' });
  }
});

// Route pour la désinscription
app.post('/api/unsubscribe', async (req, res) => {
  const { email } = req.body;

  try {
    // Recherche l'abonné par email
    const subscriber = await Subscriber.findOne({ email });
    
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Cet email n\'est pas abonné.' });
    }

    // Supprime l'abonné de la base de données
    await Subscriber.deleteOne({ email });
    res.json({ success: true, message: 'Désinscription réussie.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur lors de la désinscription.' });
  }
});

// API pour récupérer les statistiques des emails envoyés
app.get('/api/email-stats', async (req, res) => {
  try {
    // Récupérer les statistiques des emails (total emails envoyés, ouverts, et cliqués)
    const emailStats = await Email.aggregate([{
      $group: {
        _id: null,
        totalEmails: { $sum: 1 },  // Compte le nombre total d'emails envoyés
        totalOpened: { $sum: "$open_count" },  // Somme des ouvertures d'emails
        totalClicked: { $sum: "$click_count" },  // Somme des clics
      }
    }]);

    // Récupérer le nombre total d'abonnés
    const totalSubscribers = await Subscriber.countDocuments();  // Compte les abonnés

    if (emailStats.length === 0) {
      return res.status(404).json({ message: 'Aucune statistique disponible' });
    }

    // Renvoi des statistiques sous forme d'objet
    res.status(200).json({
      totalEmails: emailStats[0].totalEmails,
      totalOpened: emailStats[0].totalOpened,
      totalClicked: emailStats[0].totalClicked,
      totalSubscribers: totalSubscribers,  // Ajout du total des abonnés
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques des emails:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques des emails' });
  }
});

// API pour récupérer l'historique des envois
app.get('/api/email-history', async (req, res) => {
  try {
    const emails = await Email.find().sort({ date_sent: -1 });
    if (emails.length === 0) {
      return res.status(404).json({ message: 'Aucun email envoyé' });
    }
    res.status(200).json(emails);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'historique des emails:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique des emails' });
  }
});

// Fonction pour appeler l'API GPT-3.5
const generateContent = async (prompt) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Clé API OpenAI manquante dans les variables d'environnement.");
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erreur avec l\'API GPT:', error.response ? error.response.data : error.message);
    throw new Error('Erreur avec l\'API GPT');
  }
};

// Route pour générer du contenu via GPT-3.5
app.post('/api/generate-content', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Le prompt est requis' });
  }

  try {
    const generatedContent = await generateContent(prompt);
    res.status(200).json({ content: generatedContent });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du contenu' });
  }
});

// Middleware global pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

// Lancer le serveur sur le port 5000 ou un port défini par une variable d'environnement
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
