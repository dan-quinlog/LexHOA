
import React from 'react';
import './Amenities.css';
import clubHouseImage from './images/club-house.jpg';
import poolImage from './images/pool.jpg';
import playgroundImage from './images/playground.jpg';

function Amenities() {
  const amenities = [
    {
      name: "Club House",
      image: clubHouseImage,
      description: "Our spacious Club House features a dining hall, restrooms, and a fully-equipped kitchen. It's the perfect venue for both private and community events. Available at no charge to residents, simply schedule with the Board to reserve your spot. Whether you're planning a birthday party or a community gathering, our Club House provides the ideal setting for memorable occasions."
    },
    {
      name: "Pool",
      image: poolImage,
      description: "Enjoy our refreshing pool, open daily from 11AM to 8PM. Please note that the pool closes during inclement weather and off-season periods. We welcome guests, but kindly leave pets at home. No scheduling is required for access, so feel free to drop in anytime during open hours. While we encourage fun and relaxation, please remember that adult supervision is required as there is no lifeguard on duty. Safety first!"
    },
    {
      name: "Playground",
      image: playgroundImage,
      description: "Our delightful playground is a haven for children, featuring a sandbox, swings, and an exciting jungle gym. It's the perfect spot for kids to play, explore, and make new friends. For safety reasons, the playground is closed after dark. We kindly ask parents to supervise their children during play times. Let's work together to keep our playground a safe and enjoyable space for all our young residents!"
    }
  ];

  return (
    <div className="amenities">
      <h1>Our Amenities</h1>
      {amenities.map((amenity, index) => (
        <div key={index} className="amenity-item">
          <div className="amenity-image">
            <img src={amenity.image} alt={amenity.name} />
          </div>
          <div className="amenity-description">
            <h2>{amenity.name}</h2>
            <p>{amenity.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Amenities;
