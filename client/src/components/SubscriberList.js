import React, { useEffect, useState } from 'react';
import './SubscriberList.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FaEdit, FaTrash, FaFilePdf, FaFileCsv, FaFileExcel, FaFileCode } from 'react-icons/fa';

const SubscriberList = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [email, setEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [noSubscriberMessage, setNoSubscriberMessage] = useState('');

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/subscribers');
        if (!response.ok) throw new Error('Unable to retrieve subscribers');
        const data = await response.json();
        setSubscribers(data);
        setFilteredSubscribers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    if (searchValue === '') {
      setFilteredSubscribers(subscribers);
      setNoSubscriberMessage('');
    } else {
      const filtered = subscribers.filter((s) =>
        s.email.toLowerCase().includes(searchValue.toLowerCase())
      );
      setNoSubscriberMessage(filtered.length === 0 ? 'Email not found' : '');
      setFilteredSubscribers(filtered);
    }
  };

  const handleEditClick = (subscriber) => {
    setEditingSubscriber(subscriber);
    setEmail(subscriber.email);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/delete-subscriber/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error during deletion');
        setSubscribers(subscribers.filter((s) => s._id !== id));
        setFilteredSubscribers(filteredSubscribers.filter((s) => s._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSaveClick = async () => {
    if (!email) return alert("L'email est requis pour la mise à jour.");
    try {
      const response = await fetch(
        `http://localhost:5000/api/update-subscriber/${editingSubscriber._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      if (!response.ok) throw new Error('Error during update');
      const updatedData = await response.json();
      setSubscribers(subscribers.map((s) => (s._id === updatedData._id ? updatedData : s)));
      setFilteredSubscribers(
        filteredSubscribers.map((s) => (s._id === updatedData._id ? updatedData : s))
      );
      setEditingSubscriber(null);
      setEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Exported on: ${date}`, 200, 15, { align: 'right' });
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text('Subscriber Report', 105, 25, { align: 'center' });

    const columns = ['ID', 'Email'];
    const rows = filteredSubscribers.map((s, index) => [index + 1, s.email]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: { cellPadding: 3, fontSize: 10, halign: 'center' },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 200, 290, { align: 'right' });
    }

    doc.save('subscriber_report.pdf');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      alert("Aucun abonné à exporter.");
      return;
    }
    const headers = ["ID", "Email"];
    const rows = filteredSubscribers.map((s, index) => [index + 1, s.email]);
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscriber_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel
  const handleExportExcel = () => {
    if (filteredSubscribers.length === 0) {
      alert("Aucun abonné à exporter.");
      return;
    }
    const worksheetData = filteredSubscribers.map((sub, index) => ({
      ID: index + 1,
      Email: sub.email,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 30 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");
    XLSX.writeFile(workbook, "subscriber_report.xlsx");
  };

  // Export JSON
  const handleExportJSON = () => {
    if (filteredSubscribers.length === 0) {
      alert("Aucun abonné à exporter.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredSubscribers, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "subscriber_report.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading subscribers...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="subscriber-container">
      <h1 className="subscriber-header">Subscriber List</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {noSubscriberMessage && (
        <p className="no-subscriber-message">{noSubscriberMessage}</p>
      )}

      <div className="table-responsive">
        <table className="subscriber-table">
          <thead>
            <tr>
              <th className="subscriber-th">Email</th>
              <th className="subscriber-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.map((subscriber) => (
              <tr key={subscriber._id}>
                <td className="subscriber-td">{subscriber.email}</td>
                <td className="subscriber-td">
                  <button className="btn-edit" onClick={() => handleEditClick(subscriber)}>
                    <FaEdit /> Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteClick(subscriber._id)}>
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingSubscriber && (
        <div className="edit-form">
          <h3>Edit Subscriber</h3>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-save" onClick={handleSaveClick}>Save</button>
          <button className="btn-cancel" onClick={() => setEditingSubscriber(null)}>Cancel</button>
        </div>
      )}

      <div className="export-buttons">
        <button className="export-btn pdf" onClick={handleExportPDF}><FaFilePdf /> PDF</button>
        <button className="export-btn csv" onClick={handleExportCSV}><FaFileCsv /> CSV</button>
        <button className="export-btn excel" onClick={handleExportExcel}><FaFileExcel /> Excel</button>
        <button className="export-btn json" onClick={handleExportJSON}><FaFileCode /> JSON</button>
      </div>
    </div>
  );
};

export default SubscriberList;
