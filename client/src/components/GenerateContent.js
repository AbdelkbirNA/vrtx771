import React, { useState } from 'react';
import axios from 'axios';
import './GenerateContent.css';
const GenerateContent = () => {
  const [prompt, setPrompt] = useState('');  // État pour stocker le prompt
  const [generatedContent, setGeneratedContent] = useState('');  // Contenu généré
  const [loading, setLoading] = useState(false);  // État pour afficher le chargement
  const [error, setError] = useState('');  // État pour gérer les erreurs

  // Fonction pour gérer la soumission du prompt
  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer un prompt valide.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/generate-content', { prompt });
      setGeneratedContent(response.data.content);
    } catch (err) {
      setError('Une erreur est survenue lors de la génération du contenu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-content-container">
      <h2>Générateur de contenu GPT-4</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Entrez votre prompt ici"
        rows="4"
        cols="50"
      />
      <button onClick={handleGenerateContent} disabled={loading}>
        {loading ? 'Génération en cours...' : 'Générer du contenu'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {generatedContent && (
        <div>
          <h3>Contenu généré :</h3>
          <p>{generatedContent}</p>
        </div>
      )}
    </div>
  );
};

export default GenerateContent;
