import React from 'react';
import './PropertyCard.css';

const PropertyCard = ({ property, onEdit }) => {
  return (
    <div className="property-card">
      <div className="card-header">
        <h3>{property.address}</h3>
        <p>Property ID: {property.id}</p>
      </div>
      <div className="card-content">
        <p>Account ID: {property.accountPropertiesId}</p>
        <p>Tenant ID: {property.propertyTenantId}</p>
        <p>Created: {new Date(property.createdAt).toLocaleDateString()}</p>
        <p>Last Updated: {new Date(property.updatedAt).toLocaleDateString()}</p>
      </div>
      <div className="card-actions">
        <button className="edit-button" onClick={onEdit}>Edit</button>
      </div>
    </div>
  );
};

export default PropertyCard;
