import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaMapLocationDot } from "react-icons/fa6";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";

function PlaceCardItem({ place }) {


  const [photoUrl, setPhotoUrl] = useState(); // ✅ Declared here
  
    useEffect(() => {
      place && GetPlacePhoto();
    }, [place]);
  
    const GetPlacePhoto = async () => {
      const data = {
        textQuery:place.placeName
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
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${
        place?.placeName + " "
      }`}
      target="_blank"
    >
      <div className="border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 transition-all hover:shadow-md cursor-pointer">
        <img
          src={photoUrl || '/placeholder.png'}
          className="w-[130px] h-[130px] rounded-xl p-3 object-cover"
        />

        <div>
          <h2 className="font-bold text-lg">{place.placeName}</h2>
          <p className="text-sm text-gray-400">{place.placeDetails}</p>
          <h2 className="mt-2">🕓{place.timeTravel}</h2>
          {/* <Button size='sm'><FaMapLocationDot /></Button> */}
        </div>
      </div>
    </a>
  );
}

export default PlaceCardItem;
