import React from 'react'; // Removed useState and useEffect
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import useAuth
import NewsletterForm from './components/NewsletterForm';
import SendNewsletter from './components/SendNewsletter';
import SubscriberList from './components/SubscriberList';
import Dashboard from './components/Dashboard';
import EmailHistory from './components/EmailHistory';
import GenerateContent from './components/GenerateContent';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GeminiGeneratorPage from './pages/GeminiGeneratorPage';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';

function App() {
  const { userRole } = useAuth(); // Get userRole from context

  return (
    <Router>
      <div className="App">
        <Navbar />
        <header className="App-header">
          <h1>Gestion de Newsletter</h1>
          <p>Abonnez-vous à notre newsletter ou envoyez-la à vos abonnés</p>
        </header>

        <nav>
          {userRole === 'user' && (
            <Link to="/newsletter" className="nav-button">Formulaire d'abonnement</Link>
          )}
          {userRole === 'admin' && (
            <>
              <Link to="/newsletter" className="nav-button">Formulaire d'abonnement</Link>
              <Link to="/send-newsletter" className="nav-button">Envoyer la newsletter</Link>
              <Link to="/subscribers" className="nav-button">Liste des abonnés</Link>
              <Link to="/dashboard" className="nav-button">Tableau de bord</Link>
              <Link to="/email-history" className="nav-button">Historique des Envois</Link>
              <Link to="/generate-gemini-content" className="nav-button">Générer Contenu (Gemini)</Link>
            </>
          )}
          {!userRole && (
            <p>Please log in to access features.</p>
          )}
        </nav>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/newsletter" element={<NewsletterForm />} />
          <Route path="/send-newsletter" element={<SendNewsletter />} />
          <Route path="/subscribers" element={<SubscriberList />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/email-history" element={<EmailHistory />} />
          <Route path="/generate-content" element={<GenerateContent />} />
          <Route path="/generate-gemini-content" element={<GeminiGeneratorPage />} />
          <Route path="/" element={<h2>Bienvenue sur la page d'accueil</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
