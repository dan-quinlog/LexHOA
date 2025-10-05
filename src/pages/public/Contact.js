
import React from 'react';
import './Contact.css';

function Contact() {
  return (
    <div className="contact">
      <h1>Contact Us</h1>
      <div className="contact-content">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>Mailing Address:<br></br>1250 Hulon circle <br></br> W. Columbia SC 29169</p>
          <p>Email:<br></br>info@lexingtoncommons-weco.com</p>
          <h3>Response Times</h3>
          <p>We aim to respond as board members are available. There is no paid staff, so please allow time for a volunteer to address your inquiry.</p>
        </div>
        <div className="contact-text">
          <h2>We're Here to Help</h2>
          <p>We welcome your inquiries and value your input. If you have any questions, concerns, or need to report an issue at our properties, please don't hesitate to reach out.</p>
          <p>Our board members are dedicated volunteers committed to maintaining the quality and community spirit of Lexington Commons. While we strive to address all matters promptly, please understand that response times may vary based on the availability of our board members.</p>
          <p>Your patience and understanding are greatly appreciated as we work together to make Lexington Commons a wonderful place to live.</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
