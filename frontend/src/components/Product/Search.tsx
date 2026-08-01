import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MetaData from "@/components/Layout/MetaData";
import PredictiveSearch from "@/components/Search/PredictiveSearch";
import "@/components/Product/Search.css";

const searchSchema = z.object({
  keyword: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

const Search: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      keyword: "",
    },
  });

  const onSearchSubmit = (data: SearchFormValues) => {
    const trimmedKeyword = data.keyword?.trim();
    if (trimmedKeyword) {
      navigate(`/products/${trimmedKeyword}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <Fragment>
      <MetaData title="Search A Product -- ECOMMERCE" />
      <div className="searchBox">
        
        <div className="searchHeader">
          <h1>Discover Something New</h1>
          <p>Find the best gadgets, fashion, and lifestyle essentials with ease.</p>
        </div>

        <div className="w-full max-w-xl flex justify-center mt-6">
          <PredictiveSearch />
        </div>
      </div>
    </Fragment>
  );
};

export default Search;
