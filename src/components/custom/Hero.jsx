import React from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div className='flex flex-col items-center px-4 md:px-10 lg:px-20 xl:px-56 gap-6 md:gap-9'>
      <h1 className='font-extrabold text-3xl sm:text-4xl md:text-5xl text-center mt-12'>
        <span className='text-[#f56577]'>Discover Your Next Adventure with AI:</span><br />
        Personalized Itineraries at Your Fingertips
      </h1>

      <p className='text-base sm:text-lg md:text-xl text-gray-500 text-center'>
        Your personal trip planner and travel curator, creating custom itineraries tailored to your interests and budget.
      </p>

      <Link to='/create-trip'>
        <Button className='cursor-pointer text-base sm:text-lg px-6 py-3'>
          Get Started, It's Free
        </Button>
      </Link>

      <img src="/landing.png" alt="Hero" className='w-full max-w-[500px] mt-4 md:mt-0' />
    </div>
  );
}

export default Hero;
