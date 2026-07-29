import React from 'react';
import { CgMouse } from 'react-icons/cg';

const HeroBanner: React.FC = () => {
  return (
    <div className="banner">
      <div className="bannerContent">
        <p>Welcome to our store</p>
        <h1>Curated Collections</h1>
        <p className="subtitle">
          Handpicked essentials for your everyday lifestyle.
        </p>

        <a href="#container" className="scrollButton">
          Shop Now <CgMouse />
        </a>
      </div>
    </div>
  );
};

export default HeroBanner;
