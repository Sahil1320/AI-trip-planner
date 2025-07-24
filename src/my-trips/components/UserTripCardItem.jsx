import { GetPlaceDetails, PHOTO_REF_URL } from '@/service/GlobalApi';
import React, { useEffect, useState } from 'react'
import {Link} from 'react-router-dom';

function UserTripCardItem({trip}) {
    
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
    <Link to={'/view-trip/'+trip?.id}>

    <div className='hover:scale-105 transition-all '>
      <img src={photoUrl?photoUrl: '/placeholder.jpg'}  className="object-cover rounded-xl h-[220px]" />
      <div>
        <h2 className='font-bold text-lg'>{trip?.userSelection?.location?.label}</h2>
        <h2 className='text-sm text-gray-500'>{trip?.userSelection.noOfDays} Days trip with {trip?.userSelection?.budget} Budget</h2>
      </div>
    </div>
    </Link>
  )
}

export default UserTripCardItem
