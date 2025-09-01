const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController'); // Vérifiez l'importation ici

// Route pour l'abonnement à la newsletter
router.post('/subscribe', newsletterController.subscribe);

// Route pour l'envoi de la newsletter
router.post('/send-newsletter', newsletterController.sendNewsletter);

// Route pour récupérer la liste des abonnés
router.get('/subscribers', newsletterController.getSubscribers);

// Route pour récupérer les statistiques des emails envoyés
router.get('/email-stats', newsletterController.getEmailStats);

// Route pour les statistiques d'emails envoyés par jour
router.get('/stats/emails-over-time', newsletterController.getEmailStatsOverTime);

// Route pour récupérer l'historique des emails envoyés
router.get('/email-history', newsletterController.getEmailHistory);

// Route pour mettre à jour un abonné
router.put('/update-subscriber/:id', newsletterController.updateSubscriber);  // Vérifiez cette ligne

// Route pour supprimer un abonné
router.delete('/delete-subscriber/:id', newsletterController.deleteSubscriber);

const authController = require('../controllers/authController'); // Add this line

// Authentication Routes (Add these lines)
router.post('/auth/register', authController.registerUser);
router.post('/auth/login', authController.loginUser);
router.post('/auth/logout', authController.getMe);

module.exports = router;
