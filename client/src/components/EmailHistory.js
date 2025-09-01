import React, { useEffect, useState } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import './EmailHistory.css';

function EmailHistory() {
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 10;

  useEffect(() => {
    const fetchEmailHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/email-history');
        if (!response.ok) throw new Error('Erreur lors de la récupération de l\'historique des emails');
        const data = await response.json();
        setEmails(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEmailHistory();
  }, []);

  // Filtrer selon la recherche
  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = filteredEmails.slice(indexOfFirstEmail, indexOfLastEmail);
  const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);

  // Export PDF avec date à droite et titre centré coloré
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Date d'exportation à droite
    const exportDate = new Date().toLocaleString();
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80); // gris
    doc.text(`Date d'exportation : ${exportDate}`, pageWidth - 14, 15, { align: "right" });

    // Titre centré et coloré
    doc.setFontSize(20);
    doc.setTextColor(75, 108, 183); // bleu
    doc.text("Historique des emails", pageWidth / 2, 25, { align: "center" });

    const tableColumn = ["Sujet", "Destinataire", "Date d'envoi", "Statut"];
    const tableRows = filteredEmails.map(email => [
      email.subject,
      email.recipient,
      new Date(email.date_sent).toLocaleString(),
      email.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Page ${pageCurrent} / ${pageCount}`, data.settings.margin.left, pageHeight - 10);
      }
    });

    doc.save("historique_emails.pdf");
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Sujet", "Destinataire", "Date d'envoi", "Statut"];
    const rows = filteredEmails.map(email => [
      email.subject,
      email.recipient,
      new Date(email.date_sent).toLocaleString(),
      email.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historique_emails.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="email-history">
      <h2>Historique des envois</h2>
      {error && <p className="error-message">{error}</p>}

      <input
        type="text"
        placeholder="Rechercher par sujet, destinataire ou statut"
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        className="search-input"
      />

      {currentEmails.length > 0 ? (
        <>
          <table className="email-history-table">
            <thead>
              <tr>
                <th>Sujet</th>
                <th>Destinataire</th>
                <th>Date d'envoi</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {currentEmails.map(email => (
                <tr key={email._id}>
                  <td>{email.subject}</td>
                  <td>{email.recipient}</td>
                  <td>{new Date(email.date_sent).toLocaleString()}</td>
                  <td>
                    <span className={`email-status status-${email.status.toLowerCase()}`}>
                      {email.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination et boutons export sur la même ligne */}
          <div className="footer-container">
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </button>

              <span> Page {currentPage} sur {totalPages} </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </button>
            </div>

            <div className="export-buttons">
              <button onClick={exportToPDF} className="export-button">Exporter en PDF</button>
              <button onClick={exportToCSV} className="export-button">Exporter en CSV</button>
            </div>
          </div>
        </>
      ) : (
        <p>Aucun email trouvé</p>
      )}
    </div>
  );
}

export default EmailHistory;
