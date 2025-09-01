import React, { useState } from 'react';
import { generateGeminiContent } from '../services/api';
import './GeminiGeneratorPage.css';

const GeminiGeneratorPage = () => {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Neutre');
    const [language, setLanguage] = useState('Français');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [generatedText, setGeneratedText] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setGeneratedText('');

        try {
            const response = await generateGeminiContent(topic, tone, language);
            setGeneratedText(response.data.text);
        } catch (err) {
            setError('Erreur lors de la génération du contenu. Veuillez réessayer.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="gemini-generator-container">
            <h2>Générateur de Contenu de Newsletter (Gemini)</h2>
            <p>Créez du contenu de newsletter de haute qualité en quelques secondes.</p>
            <form onSubmit={handleSubmit} className="gemini-form">
                <div className="form-group">
                    <label htmlFor="topic">Sujet de la newsletter</label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Les dernières tendances technologiques"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="tone">Ton de la rédaction</label>
                    <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)}>
                        <option value="Neutre">Neutre</option>
                        <option value="Amical">Amical</option>
                        <option value="Professionnel">Professionnel</option>
                        <option value="Humoristique">Humoristique</option>
                        <option value="Informatif">Informatif</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="language">Langue</label>
                    <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="Français">Français</option>
                        <option value="Anglais">Anglais</option>
                        <option value="Espagnol">Espagnol</option>
                    </select>
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Génération en cours...' : 'Générer le contenu'}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}

            {generatedText && (
                <div className="generated-content-area">
                    <h3>Contenu Généré :</h3>
                    <textarea
                        className="content-html"
                        value={generatedText}
                        readOnly
                    />
                </div>
            )}
        </div>
    );
};

export default GeminiGeneratorPage;
