import React from "react";
import Hero from "./Hero";
import Features from "./Features";
import SearchSection from "./SearchSection";
import FeaturedProducts from "./FeaturedProducts";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      {/* <SearchSection /> */}
      <Features />
      <FeaturedProducts />
    </div>
  );
};

export default HomePage;
