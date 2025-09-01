import React, { useState } from 'react';
import axios from 'axios';
import './NewsletterForm.css';
import { FaSpinner } from 'react-icons/fa';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState('weekly');
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(true);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !preferences.trim()) {
      setMessage('Tous les champs doivent être remplis.');
      return;
    }
    if (!emailValid) {
      setMessage('Veuillez entrer un email valide.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/subscribe', {
        email,
        preferences
      });
      setMessage(response.data.message);
      setEmail('');
    } catch {
      setMessage('Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!unsubscribeEmail.trim()) {
      setMessage('Veuillez entrer un email valide.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/unsubscribe', {
        email: unsubscribeEmail
      });
      if (response.data.success) {
        setMessage('Vous avez bien été désabonné.');
        setUnsubscribeEmail('');
      } else {
        setMessage('Cet email n\'est pas abonné.');
      }
    } catch {
      setMessage('Erreur lors du désabonnement.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setEmailValid(/\S+@\S+\.\S+/.test(val));
  };

  return (
    <div className="newsletter-container">
      <h2 className="newsletter-title">Abonnez-vous à notre newsletter</h2>

      <form className="newsletter-form" onSubmit={handleSubscribe}>
        <label className="newsletter-label">
          Email :
          <input
            className={`newsletter-input ${!emailValid ? 'invalid' : ''}`}
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="votre.email@example.com"
            required
          />
        </label>
        {!emailValid && <p className="newsletter-message error">Email invalide</p>}

        <label className="newsletter-label">
          Préférences :
          <select
            className="newsletter-select"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          >
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuel</option>
          </select>
        </label>

        <button className="newsletter-button subscribe" type="submit" disabled={loading}>
          {loading ? <FaSpinner className="icon-spin" /> : "S'abonner"}
        </button>
      </form>

      {message && (
        <p className={`newsletter-message ${message.includes('Erreur') ? 'error' : 'success'}`}>
          {message}
        </p>
      )}

      <div className="unsubscribe-section">
        <h3 className="unsubscribe-title">Se désabonner</h3>
        <form onSubmit={handleUnsubscribe}>
          <label className="newsletter-label">
            Email :
            <input
              className="newsletter-input"
              type="email"
              value={unsubscribeEmail}
              onChange={(e) => setUnsubscribeEmail(e.target.value)}
              placeholder="votre.email@example.com"
              required
            />
          </label>

          <button className="newsletter-button unsubscribe" type="submit" disabled={loading}>
            {loading ? <FaSpinner className="icon-spin" /> : "Se désabonner"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewsletterForm;
