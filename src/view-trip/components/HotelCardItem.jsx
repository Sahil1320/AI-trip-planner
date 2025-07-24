import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import React, { useEffect, useState } from "react";

function HotelCardItem({ hotel }) {
  const [photoUrl, setPhotoUrl] = useState(); // ✅ Declared here

  useEffect(() => {
    hotel && GetPlacePhoto();
  }, [hotel]);

  const GetPlacePhoto = async () => {
    const data = {
      textQuery: hotel?.hotelName
    };
    try {
      const resp = await GetPlaceDetails(data);
      const photoName = resp?.data?.places?.[0]?.photos?.[3]?.name;
      if (photoName) {
        const url = PHOTO_REF_URL(photoName); // ✅ Called here
        setPhotoUrl(url);
      }
    } catch (error) {
      console.error("Photo fetch error:", error?.response?.data || error.message);
    }
  };

  // ✅ This is the only return
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${hotel?.hotelName + " " + hotel?.hotelAddress}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:scale-110 transition-all cursor-pointer block"
    >
      
      <img
        src={photoUrl || '/placeholder.jpg'}
        alt="hotel"
        className="rounded-xl w-full h-[180px] object-cover"
      />
      <div className="my-2 flex flex-col gap-2">
        <h2 className="font-medium text-sm md:text-base">{hotel?.hotelName}</h2>
        <h2 className="text-xs text-gray-500">📍{hotel?.hotelAddress}</h2>
        <h2 className="text-sm">💰{hotel?.price}</h2>
        <h2 className="text-sm">⭐{hotel?.rating}</h2>
      </div>
    </a>
  );
}

export default HotelCardItem;
