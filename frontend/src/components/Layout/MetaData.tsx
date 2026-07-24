import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

interface MetaDataProps {
  title: string;
}

const MetaData: React.FC<MetaDataProps> = ({ title }) => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
      </Helmet>
    </HelmetProvider>
  );
};

export default MetaData;
