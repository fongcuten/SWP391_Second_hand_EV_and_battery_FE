import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Features from './Features';
import SearchSection from './SearchSection';
import FeaturedProducts from './FeaturedProducts';
import Footer from './Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <SearchSection />
        <Features />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
