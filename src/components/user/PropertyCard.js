import { useQuery } from '@apollo/client';
import { GET_PROFILE } from '../../queries/queries';

const PropertyCard = ({ property }) => {
  const { data: tenantData } = useQuery(GET_PROFILE, {
    variables: { id: property.propertyTenantId },
    skip: !property.propertyTenantId
  });

  const tenant = tenantData?.getPerson;

  return (
    <div className="user-card property-card">
      <h3>Property Information</h3>
      <div className="card-content two-column">
        <div className="left-column">
          <p>Address: {property.address}</p>
          <p>Unit ID: {property.id}</p>
        </div>
        {tenant && (
          <div className="right-column">
            <p>Tenant Name: {tenant.name}</p>
            <p>Phone: {tenant.phone}</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default PropertyCard;

