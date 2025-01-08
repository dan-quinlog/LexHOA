const PersonCard = ({ person }) => {
  const [address1, address2] = person.address ? person.address.split('|') : ['', ''];

  return (
    <div className="user-card person-card">
      <h3>Profile Information</h3>
      <div className="card-content two-column">
        <div className="left-column">
          <p>Name: {person.name}</p>
          <p>Address: {address1}</p>
          <p>Address 2: {address2}</p>
          <p className="location-line">{person.city} {person.state} {person.zip}</p>
        </div>
        <div className="right-column">
          <p>Phone: {person.phone}</p>
          <p>Email: {person.email}</p>
          <p>Contact Preference: {person.contactPref}</p>
          <p>Text Messages: {person.allowText ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonCard;