import React from "react";
import ProductForm from "@/components/Admin/ProductForm";

const NewProduct: React.FC = () => {
  return <ProductForm isEdit={false} />;
};

export default NewProduct;
