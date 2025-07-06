import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ComplaintManagement.css';

const ComplaintManagement = () => {
  const role = localStorage.getItem('userRole');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (role === 'Admin') {
      setLoading(true);
      axios.get('http://localhost:3002/api/complaints/all', { withCredentials: true })
        .then(response => setComplaints(Array.isArray(response.data) ? response.data : []))
        .catch(() => setError('Error fetching complaints'))
        .finally(() => setLoading(false));
    }
  }, [role]);

  const handleSeeMore = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  if (role !== 'Admin') {
    return <h1>Medical Officer Complaints</h1>;
  }

  return (
    <div>
      <h1>Admin Complaints</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {!loading && !error && (
        <table className="complaint-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Complaint Submitted At</th>
              <th>Canteen Name</th>
              <th>Price (Rs.)</th>
              <th>Payment Mode</th>
              <th>Complaint Type</th>
              <th>Status</th>
              <th>See more</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr><td colSpan={12} style={{ textAlign: 'center', padding: '20px' }}>No complaints found.</td></tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint._id || complaint.id} style={{ background: '#fff', transition: 'background 0.2s' }}>
                  <td>{complaint.orderId}</td>
                  <td>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : '-'}</td>
                  <td>{complaint.canteenName}</td>
                  <td>{complaint.price}</td>
                  <td>{complaint.paymentMode}</td>
                  <td>{complaint.complaintType}</td>
                  <td>{complaint.status}</td>
                  <td className="complaint-see-more">
                    <span
                      title="See more"
                      onClick={() => handleSeeMore(complaint)}
                      className="see-more-icon"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="#1976d2" strokeWidth="2" fill="#fff" />
                        <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" fill="#1976d2" />
                        <circle cx="12" cy="12" r="1.5" fill="#fff" />
                      </svg>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      {/* Modal Popup */}
      {showModal && selectedComplaint && (
        <div className="complaint-modal-overlay">
          <div className="complaint-modal-box">
            <button
              onClick={handleCloseModal}
              className="complaint-modal-close"
              title="Close"
            >
              &times;
            </button>
            {/* Header Section */}
            <div className="complaint-modal-header">
              <div className="complaint-modal-header-section left">
                <div className="complaint-modal-header-title">Order Details:</div>
                <div className="complaint-modal-header-row">Order ID: {selectedComplaint.orderId}</div>
                <div className="complaint-modal-header-row">Ordered date: {selectedComplaint.orderedDate ? new Date(selectedComplaint.orderedDate).toLocaleString() : '-'}</div>
                <div className="complaint-modal-header-row">Total price: {selectedComplaint.price}</div>
                <div className="complaint-modal-header-row">Payment mode: {selectedComplaint.paymentMode}</div>
                <div className="complaint-modal-header-row">Canteen name: {selectedComplaint.canteenName}</div>
              </div>
              <div className="complaint-modal-header-section right">
                <div className="complaint-modal-header-title">Complaint details:</div>
                <div className="complaint-modal-header-row">Complaint created at: {selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleString() : '-'}</div>
                <div className="complaint-modal-header-row">Complaint type: {selectedComplaint.complaintType}</div>
                <div className="complaint-modal-header-row">Complaint status: {selectedComplaint.status}</div>
              </div>
            </div>
            <hr style={{ margin: '8px 0' }} />
            {/* Title, Image, Description */}
            <div className="complaint-modal-label">1) Title:</div>
            <div className="complaint-modal-description">{selectedComplaint.title || <span className="complaint-modal-no-description">No Title</span>}</div>
            <div className="complaint-modal-label">2) Image:</div>
            <div className="complaint-modal-image-section">
              {selectedComplaint.image ? (
                <a
                  href={`https://ucfpbbcfacgrehcoscar.supabase.co/storage/v1/object/public/canteenz/${selectedComplaint.image}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`https://ucfpbbcfacgrehcoscar.supabase.co/storage/v1/object/public/canteenz/${selectedComplaint.image}`}
                    alt="Complaint"
                    className="complaint-modal-image"
                  />
                </a>
              ) : (
                <span className="complaint-modal-no-image">No image</span>
              )}
            </div>
            <div className="complaint-modal-label">3) Description:</div>
            <div className="complaint-modal-description">{selectedComplaint.description || <span className="complaint-modal-no-description">No description</span>}</div>
            {/* Action Buttons */}
            <div className="complaint-modal-actions">
              <button className="complaint-modal-btn send-mo">Send to MO</button>
              <button className="complaint-modal-btn reply">Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
