import React from 'react';
import {
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaUndoAlt,
} from 'react-icons/fa';

const ServicesSection: React.FC = () => {
  return (
    <section className="servicesSection">
      <div className="serviceCard">
        <FaShippingFast className="serviceIcon" />
        <h3>Free Shipping</h3>
        <p>On all orders over $100</p>
      </div>
      <div className="serviceCard">
        <FaShieldAlt className="serviceIcon" />
        <h3>Secure Payment</h3>
        <p>100% secure checkout</p>
      </div>
      <div className="serviceCard">
        <FaHeadset className="serviceIcon" />
        <h3>24/7 Support</h3>
        <p>Dedicated support anytime</p>
      </div>
      <div className="serviceCard">
        <FaUndoAlt className="serviceIcon" />
        <h3>Easy Returns</h3>
        <p>30-day return policy</p>
      </div>
    </section>
  );
};

export default ServicesSection;
