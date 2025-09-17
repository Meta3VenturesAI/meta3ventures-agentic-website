import React from 'react';
import { Hero } from './sections/Hero';
import { FocusPillars } from './sections/FocusPillars';
import { ValueFlywheel } from './sections/ValueFlywheel';
import Services from './sections/Services';
import { About } from './sections/About';
import { Contact } from './sections/Contact';

export const Home: React.FC = () => {
  return (
    <div className="w-full">
      <Hero />
      <FocusPillars />
      <ValueFlywheel />
      <Services />
      <About />
      <Contact />
    </div>
  );
};