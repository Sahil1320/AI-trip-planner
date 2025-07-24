import React from 'react';
import HotelCardItem from './HotelCardItem';

function Hotels({ trip }) {
  return (
    <div>
      <h2 className='font-bold text-xl mt-5 p-8'>Hotel Recommended</h2>

      <div className='grid grid-cols-2 my-5 md:grid-cols-3 xl:grid-cols-4 gap-5 p-5'>
        {trip?.tripData?.hotelOptions?.map((hotel, index) => {
          return (
            <HotelCardItem hotel={hotel}/>
          );
        })}
      </div>
    </div>
  );
}

export default Hotels;
