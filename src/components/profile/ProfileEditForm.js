import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PROFILE } from '../../queries/mutations';

const US_STATES = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    // ... add all states in alphabetical order
    { value: 'WY', label: 'Wyoming' }
];

const ProfileEditForm = ({ profile, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        email: profile?.email || '',
        address1: profile?.address1 || '',
        address2: profile?.address2 || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip: profile?.zip || '',
        phoneCall: profile?.phoneCall || '',
        phoneText: profile?.phoneText || '',
        contactPref: profile?.contactPref || '',
        sameAsCall: false
    });

    const [errors, setErrors] = useState({});
    const [updateProfile] = useMutation(UPDATE_PROFILE);

    // Phone number formatting
    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};
       
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                await updateProfile({
                    variables: {
                        input: {
                            id: profile.id,
                            email: formData.email,
                            name: formData.name || null,
                            address1: formData.address1 || null,
                            address2: formData.address2 || null,
                            city: formData.city || null,
                            state: formData.state || null,
                            zip: formData.zip || null,
                            phoneCall: formData.phoneCall || null,
                            phoneText: formData.phoneText || null,
                            contactPref: formData.contactPref || null
                        }
                    }
                });
                onSave('Profile updated successfully');
            } catch (error) {
                onSave('Error updating profile', true);
            }
        }
    };
    return (
        <>
            <div className="profile-header">
                <h2>Profile Details</h2>
                <div className="button-group">
                    <button className="save-button" onClick={handleSubmit}>Save</button>
                    <button className="cancel-button" onClick={onCancel}>Cancel</button>
                </div>
            </div>
            <div className="profile-content">
                <div className="left-column">
                    <div className="field-group">
                        <div className="field-label">Name*</div>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    <div className="field-group">
                        <div className="field-label">Address</div>
                        <input
                            type="text"
                            placeholder="Address Line 1"
                            value={formData.address1}
                            onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Address Line 2"
                            value={formData.address2}
                            onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                        />
                        <div className="address-row">
                            <input
                                type="text"
                                placeholder="City"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                            <select
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            >
                                <option value="">State</option>
                                {US_STATES.map(state => (
                                    <option key={state.value} value={state.value}>{state.label}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="ZIP"
                                value={formData.zip}
                                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    <div className="field-group">
                        <div className="field-label">Email*</div>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="field-group">
                        <div className="field-label">Phone (Call)</div>
                        <input
                            type="text"
                            value={formData.phoneCall}
                            onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                setFormData({ ...formData, phoneCall: formatted });
                            }}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field-label">Phone (Text)</div>
                        <div className="phone-text-group">
                            <input
                                type="text"
                                value={formData.phoneText}
                                disabled={formData.sameAsCall}
                                onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    setFormData({ ...formData, phoneText: formatted });
                                }}
                            />
                            <label className="same-as-call">
                                <input
                                    type="checkbox"
                                    checked={formData.sameAsCall}
                                    onChange={(e) => setFormData({ ...formData, sameAsCall: e.target.checked })}
                                />
                                <span>Same as calling</span>
                            </label>
                        </div>
                    </div>

                    <div className="field-group">
                        <div className="field-label">Contact Preference*</div>
                        <select
                            value={formData.contactPref}
                            onChange={(e) => setFormData({ ...formData, contactPref: e.target.value })}
                        >
                            <option value="">Select preference</option>
                            <option value="CALL">Call</option>
                            <option value="TEXT">Text</option>
                            <option value="EMAIL">Email</option>
                            <option value="PHYSICAL">Physical Mail</option>
                        </select>
                        {errors.contactPref && <span className="error-text">{errors.contactPref}</span>}
                    </div>
                </div>
            </div>
        </>
    );
};
export default ProfileEditForm;
