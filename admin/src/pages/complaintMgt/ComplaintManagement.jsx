import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config/appConfig';
import './ComplaintManagement.css';

const ComplaintManagement = () => {
  // Handler for action change
  const handleActionChange = async (complaintId, newAction) => {
    try {
      setLoading(true);
      await axios.put(
        `${config.api_base_urls.admin}/api/complaints/${complaintId}/action`,
        { action: newAction },
        { withCredentials: true }
      );
      // Refresh complaints list
  const response = await axios.get(`${config.api_base_urls.user}/api/complaints/all`, { withCredentials: true });
      setComplaints(Array.isArray(response.data) ? response.data : []);
      // If modal is open, update selectedComplaint action locally
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, action: newAction });
      }
    } catch (err) {
      setError('Error updating action');
    } finally {
      setLoading(false);
    }
  };
  // Track complaints that have ever appeared in MO section, persist in localStorage
  const [moComplaintIds, setMoComplaintIds] = useState(() => {
    const stored = localStorage.getItem('moComplaintIds');
    return stored ? JSON.parse(stored) : [];
  });
  const role = localStorage.getItem('userRole');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const statusOptions = [
    'Pending',
    'On Investigation',
    'On MO Investigation',
    'MO Investigation Completed',
    'Investigation Completed',
    'Complaint Closed'
  ];

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(
        `${config.api_base_urls.admin}/api/complaints/${complaintId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      // Refresh complaints list
  const response = await axios.get(`${config.api_base_urls.user}/api/complaints/all`, { withCredentials: true });
      setComplaints(Array.isArray(response.data) ? response.data : []);
      // If modal is open, update selectedComplaint status locally
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    } catch (err) {
      setError('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  // Handler for Send to MO button
  const handleSendToMO = async () => {
    if (!selectedComplaint) return;
    await handleStatusChange(selectedComplaint._id || selectedComplaint.id, 'On MO Investigation');
  };

  useEffect(() => {
    if (role === 'Admin' || role === 'Medical Officer') {
      setLoading(true);
  axios.get(`${config.api_base_urls.user}/api/complaints/all`, { withCredentials: true })
        .then(response => {
          const data = Array.isArray(response.data) ? response.data : [];
          setComplaints(data);
          // For MO, track complaints that ever had 'On MO Investigation' status
          if (role === 'Medical Officer') {
            setMoComplaintIds(prev => {
              const newIds = data.filter(c => c.status === 'On MO Investigation').map(c => c._id || c.id);
              const updated = Array.from(new Set([...prev, ...newIds]));
              localStorage.setItem('moComplaintIds', JSON.stringify(updated));
              return updated;
            });
          }
        })
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


  if (role !== 'Admin' && role !== 'Medical Officer') {
    return <h1>Unauthorized</h1>;
  }

  return (
    <div>
      <h1>Complaints</h1>
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
                <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(role === 'Medical Officer'
              ? complaints.filter(c => moComplaintIds.includes(c._id || c.id))
              : complaints
            ).length === 0 ? (
              <tr><td colSpan={12} style={{ textAlign: 'center', padding: '20px' }}>No complaints found.</td></tr>
            ) : (
              (role === 'Medical Officer'
                ? complaints.filter(c => moComplaintIds.includes(c._id || c.id))
                : complaints
              ).map((complaint) => (
                <tr key={complaint._id || complaint.id} style={{ background: '#fff', transition: 'background 0.2s' }}>
                  <td>{complaint.orderId}</td>
                  <td>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : '-'}</td>
                  <td>{complaint.canteenName}</td>
                  <td>{complaint.price}</td>
                  <td>{complaint.paymentMode}</td>
                  <td>{complaint.complaintType}</td>
                  <td>
                    <select
                      value={complaint.status}
                      onChange={e => handleStatusChange(complaint._id || complaint.id, e.target.value)}
                      style={{ padding: '4px', borderRadius: '4px' }}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="complaint-see-more">
                    <span
                      title="See more"
                      onClick={() => handleSeeMore(complaint)}
                      className="see-more-icon"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                    >
                      {/* Modern eye icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#1976d2" strokeWidth="2" fill="#fff"/>
                        <circle cx="12" cy="12" r="3" stroke="#1976d2" strokeWidth="2" fill="#1976d2"/>
                      </svg>
                    </span>
                  </td>
                    <td>
                      <select
                        value={complaint.action || "-----"}
                        onChange={e => handleActionChange(complaint._id || complaint.id, e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px' }}
                      >
                        <option value="-----">-----</option>
                        <option value="Refund">Refund</option>
                        <option value="Reject">Reject</option>
                      </select>
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
              {role === 'Admin' ? (
                <button className="complaint-modal-btn send-mo" onClick={handleSendToMO}>Send to MO</button>
              ) : role === 'Medical Officer' ? (
                <button className="complaint-modal-btn send-mo" onClick={() => handleStatusChange(selectedComplaint._id || selectedComplaint.id, 'MO Investigation Completed')}>Send to Admin</button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
