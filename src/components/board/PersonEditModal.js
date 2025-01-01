import React, { useState } from 'react';
import Modal from '../shared/Modal';
import './PersonEditModal.css';
const PersonEditModal = ({ person, onClose, show }) => {
    const [formData, setFormData] = useState({
        name: person?.name || '',
        email: person?.email || '',
        phone: person?.phone || '',
        role: person?.role || '',
        status: person?.status || 'ACTIVE',
        cognitoID: person?.cognitoID || ''
    });

    const handleSubmit = async () => {
        // Add mutation logic here
        onClose();
    };

    if (!show) return null;
    return (
        <Modal show={show} onClose={onClose}>
            <h2>{person?.id ? 'Edit Person' : 'Create New Person'}</h2>

            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>Phone</label>
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>Role</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                >
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                </select>
            </div>

            <div className="form-group">
                <label>Status</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>

            <div className="modal-actions">
                <button onClick={handleSubmit}>
                    {person?.id ? 'Save' : 'Create'}
                </button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </Modal>
    );
};

export default PersonEditModal;