import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PROFILE } from '../../queries/mutations';
import { US_STATES } from '../../utils/constants';

const ProfileEditForm = ({ profile, onCancel, onSave }) => {
    // Split initial address if it exists
    const initialAddressParts = profile?.address ? profile.address.split('|') : ['', ''];

    const [formData, setFormData] = useState({
        name: profile?.name || '',
        email: profile?.email || '',
        address: profile?.address || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip: profile?.zip || '',
        phone: profile?.phone || '',
        allowText: profile?.allowText || false,
        contactPref: profile?.contactPref || ''
    });

    const [errors, setErrors] = useState({});
    const [updateProfile] = useMutation(UPDATE_PROFILE);

    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.address) {
            newErrors.address = 'Address is required';
        }

        if (!formData.city) {
            newErrors.city = 'City is required';
        }

        if (!formData.state) {
            newErrors.state = 'State is required';
        }

        if (!formData.zip) {
            newErrors.zip = 'ZIP code is required';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.contactPref) {
            newErrors.contactPref = 'Contact preference is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddressChange = (line1, line2) => {
        const newAddress = line1 + (line2 ? `|${line2}` : '');
        setFormData(prev => ({ ...prev, address: newAddress }));
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                const mutationInput = {
                    variables: {
                        input: {
                            id: profile.id,
                            email: formData.email,
                            name: formData.name,
                            address: formData.address,
                            city: formData.city,
                            state: formData.state,
                            zip: formData.zip,
                            phone: formData.phone,
                            allowText: formData.allowText,
                            contactPref: formData.contactPref,
                            owner: profile.owner
                        }
                    }
                };
                await updateProfile(mutationInput);
                onSave('Profile updated successfully');
            } catch (error) {
                console.log('Mutation Error:', error);
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
                            value={formData.address.split('|')[0]}
                            onChange={(e) => handleAddressChange(e.target.value, formData.address.split('|')[1])}
                        />
                        <input
                            type="text"
                            placeholder="Address Line 2"
                            value={formData.address.split('|')[1] || ''}
                            onChange={(e) => handleAddressChange(formData.address.split('|')[0], e.target.value)}
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
                        <div className="field-label">Phone Number</div>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                setFormData({ ...formData, phone: formatted });
                            }}
                        />
                    </div>

                    <div className="field-group">
                        <div className="text-consent-row">
                            <input
                                type="checkbox"
                                checked={formData.allowText}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    allowText: e.target.checked
                                }))}
                            />
                            <span>I agree to receive text messages</span>
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
