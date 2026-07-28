import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MetaData from "@/components/Layout/MetaData";
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
        <MetaData title="Explore Our Products -- ECOMMERCE" />
        
        <div className="searchHeader">
          <h1>Discover Something New</h1>
          <p>Find the best gadgets, fashion, and lifestyle essentials with ease.</p>
        </div>

        <form className="searchInputContainer" onSubmit={handleSubmit(onSearchSubmit)}>
          <input
            type="text"
            placeholder="Search our catalog (e.g. Laptop, Nike, Blue)..."
            {...register("keyword")}
          />
          <input type="submit" value="Search Now" />
        </form>
      </div>
    </Fragment>
  );
};

export default Search;
