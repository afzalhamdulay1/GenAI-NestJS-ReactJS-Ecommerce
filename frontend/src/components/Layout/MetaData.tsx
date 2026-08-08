import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

interface MetaDataProps {
  title: string;
  description?: string;
}

const MetaData: React.FC<MetaDataProps> = ({ title, description }) => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
    </HelmetProvider>
  );
};

export default MetaData;
