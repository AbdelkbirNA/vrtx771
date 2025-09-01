const Subscriber = require('../models/Subscriber');
const Email = require('../models/Email');
const nodemailer = require('nodemailer');

// Fonction pour l'abonnement
const subscribe = async (req, res) => {
  const { email, preferences } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'L\'email est requis pour l\'abonnement.' });
  }

  try {
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Cet email est déjà abonné.' });
    }

    const newSubscriber = new Subscriber({
      email,
      preferences: preferences || 'weekly', // Valeur par défaut
    });

    await newSubscriber.save();
    res.status(201).json({ message: 'Abonnement réussi !' });
  } catch (err) {
    console.error('Erreur lors de l\'abonnement:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'abonnement' });
  }
};

// Fonction pour l'envoi de la newsletter
const sendNewsletter = async (req, res) => {
  const { subject, content } = req.body;

  if (!subject || !content) {
    return res.status(400).json({ message: 'Le sujet et le contenu sont requis.' });
  }

  try {
    const subscribers = await Subscriber.find();

    if (subscribers.length === 0) {
      return res.status(404).json({ message: 'Aucun abonné trouvé.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (let subscriber of subscribers) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: subscriber.email,
        subject: subject,
        text: content,
      };

      await transporter.sendMail(mailOptions);  // Envoi de l'email

      console.log(`Newsletter envoyée à ${subscriber.email}`);

      const newEmail = new Email({
        subject,
        recipient: subscriber.email,
        status: 'sent',
        body: content,
        open_count: 0,
        click_count: 0,
      });
      await newEmail.save();
    }

    res.status(200).json({ message: 'Newsletter envoyée à tous les abonnés !' });
  } catch (err) {
    console.error('Erreur lors de l\'envoi de la newsletter:', err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la newsletter', error: err.message });
  }
};

// Fonction pour récupérer les abonnés
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find();

    if (!subscribers.length) {
      return res.status(404).json({ message: 'Aucun abonné trouvé.' });
    }

    res.status(200).json(subscribers);
  } catch (err) {
    console.error('Erreur lors de la récupération des abonnés:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des abonnés', error: err.message });
  }
};

// Fonction pour récupérer les statistiques des emails envoyés
const getEmailStats = async (req, res) => {
  try {
    const stats = await Email.aggregate([
      {
        $group: {
          _id: null,
          totalEmails: { $sum: 1 }, // Total des emails envoyés
          totalOpened: { $sum: "$open_count" }, // Total des ouvertures
          totalClicked: { $sum: "$click_count" }, // Total des clics
        }
      }
    ]);
    res.status(200).json(stats[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques des emails:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

// Fonction pour récupérer l'historique des emails envoyés
const getEmailHistory = async (req, res) => {
  try {
    const emails = await Email.find().sort({ date_sent: -1 }); // Tri par date décroissante
    if (emails.length === 0) {
      return res.status(404).json({ message: 'Aucun email trouvé dans l\'historique' });
    }

    res.status(200).json(emails);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'historique des emails:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique des emails' });
  }
};

// Fonction pour mettre à jour un abonné
const updateSubscriber = async (req, res) => {
  const { id } = req.params;
  const { email, preferences } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'L\'email est requis pour la mise à jour.' });
    }

    const updatedSubscriber = await Subscriber.findByIdAndUpdate(id, { email, preferences }, { new: true });

    if (!updatedSubscriber) {
      return res.status(404).json({ message: 'Abonné non trouvé.' });
    }

    res.status(200).json(updatedSubscriber);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'abonné:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'abonné' });
  }
};

// Fonction pour supprimer un abonné
const deleteSubscriber = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return res.status(404).json({ message: 'Abonné non trouvé.' });
    }

    res.status(200).json({ message: 'Abonné supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'abonné:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'abonné' });
  }
};

// Fonction pour récupérer les statistiques d\'envoi d\'emails par jour
const getEmailStatsOverTime = async (req, res) => {
  try {
    const stats = await Email.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date_sent" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Trier par date croissante
      }
    ]);

    if (stats.length === 0) {
      return res.status(404).json({ message: 'Aucune donnée de statistique trouvée.' });
    }

    // Formatter les données pour le graphique
    const formattedStats = stats.map(item => ({
      date: item._id,
      count: item.count
    }));

    res.status(200).json(formattedStats);
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques d\'emails par jour:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

module.exports = { subscribe, sendNewsletter, getSubscribers, getEmailStats, getEmailHistory, updateSubscriber, deleteSubscriber, getEmailStatsOverTime };
