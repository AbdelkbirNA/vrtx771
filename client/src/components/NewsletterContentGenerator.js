import React, { useState } from 'react';

function NewsletterContentGenerator() {
  // States pour le contenu, le sujet, le résumé et les erreurs
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  // Fonction pour générer le sujet et le résumé
  const handleGenerateContent = async () => {
    try {
      // Envoi du contenu à l'API backend
      const response = await fetch('http://localhost:5000/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      // Si la requête est réussie, on récupère les données générées
      const data = await response.json();
      setSubject(data.subject);
      setSummary(data.summary);
      setError('');
    } catch (err) {
      // En cas d'erreur, on affiche un message
      setError('Erreur lors de la génération du contenu');
    }
  };

  return (
    <div>
      <h2>Générateur de contenu pour la Newsletter</h2>
      
      {/* Zone de texte pour que l'utilisateur entre le contenu */}
      <textarea
        placeholder="Entrez votre contenu ici..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="5"
        cols="40"
      ></textarea>
      
      {/* Bouton pour générer le sujet et résumé */}
      <button onClick={handleGenerateContent}>Générer sujet et résumé</button>

      {/* Affichage de l'erreur, s'il y en a */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Affichage du sujet généré */}
      {subject && (
        <div>
          <h3>Sujet généré :</h3>
          <p>{subject}</p>
        </div>
      )}

      {/* Affichage du résumé généré */}
      {summary && (
        <div>
          <h3>Résumé généré :</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default NewsletterContentGenerator;
