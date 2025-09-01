import React, { useState } from 'react';
import axios from 'axios';
import './SendNewsletter.css';
import { FaSpinner } from 'react-icons/fa'; // Spinner moderne

function SendNewsletter() {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!subject.trim() || !content.trim()) {
            setMessage("Le sujet et le contenu ne peuvent pas être vides.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/send-newsletter', {
                subject,
                content
            });
            setMessage(response.data.message || "Newsletter envoyée avec succès !");
        } catch (error) {
            setMessage('Erreur lors de l\'envoi de la newsletter.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="send-newsletter-container">
            <h2 className="send-newsletter-title">Envoyer la Newsletter</h2>
            <form className="send-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <label className="send-newsletter-label">Sujet
                    <input
                        className="send-newsletter-input"
                        type="text"
                        placeholder="Entrez le sujet de la newsletter"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </label>

                <label className="send-newsletter-label">Contenu
                    <textarea
                        className="send-newsletter-textarea"
                        placeholder="Entrez le contenu de la newsletter"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </label>

                <button
                    type="button"
                    onClick={handleSend}
                    className="send-newsletter-button"
                    disabled={loading}
                >
                    {loading ? <FaSpinner className="icon-spin" /> : 'Envoyer'}
                </button>
            </form>

            {message && (
                <p className={`send-newsletter-message ${message.includes('Erreur') ? 'error' : 'success'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default SendNewsletter;
