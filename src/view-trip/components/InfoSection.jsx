import React, { useEffect, useState } from 'react'
import { IoIosSend } from "react-icons/io";
import { Button } from '@/components/ui/button';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';

function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState(); // ✅ define photoUrl

  useEffect(() => {
    if (trip?.userSelection?.location?.label) {
      const GetPlacePhoto = async () => {
        try {
          const resp = await GetPlaceDetails({
            textQuery: trip?.userSelection?.location?.label
          });

          const photoName = resp?.data?.places?.[0]?.photos?.[0]?.name;
          if (photoName) {
            const url = PHOTO_REF_URL(photoName);
            setPhotoUrl(url);
          }
        } catch (error) {
          console.error("Image fetch error:", error);
        }
      };

      GetPlacePhoto();
    }
  }, [trip]);

  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56'>
      <img
        src={photoUrl || "/placeholder.png"} // fallback image
        className='h-[340px] w-full object-cover rounded-xl'
        alt='Trip Location'
      />

      <div className='flex justify-between items-center '>
        <div className='my-5 flex flex-col gap-2'>
          <h2 className='font-bold text-2xl'>{trip?.userSelection?.location?.label}</h2>
          <div className='flex gap-5'>
            <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text:md'>
              🗓️ {trip.userSelection?.noOfDays} Day
            </h2>
            <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text:md'>
              💰 {trip.userSelection?.budget} Budget
            </h2>
            <h2 className='p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text:md'>
              🧑🏽‍🤝‍🧑🏽 No. of Traveler: {trip.userSelection?.traveler}
            </h2>
          </div>
        </div>
        <Button><IoIosSend /></Button>
      </div>
    </div>
  );
}

export default InfoSection;
