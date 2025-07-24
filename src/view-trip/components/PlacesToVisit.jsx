import React from 'react'
import PlaceCardItem from './PlaceCardItem'

function PlacesToVisit({trip}) {
  return (
    <div>
      <h2 className='font-bold text-lg p-5'>Places to Visit</h2>

      <div>
        {trip.tripData?.itinerary.map((item,index)=>(
            
            <div className='mt-5'>
                <h2 className='font-medium text-lg p-5'>Day {item.day}</h2>
                <div className='grid md:grid-cols-2 gap-5 p-8'>
                
                {item?.places?.map((place,index)=>(
                    <div key={index}>
                        <h2 className='font-medium text-sm text-orange-300'>{place.bestTimeToVisit}</h2>
                        <PlaceCardItem  place={place}/>
                    </div>
                       
                   
                ))}
                 </div>
            </div>

        ))}
      </div>
    </div>
  )
}

export default PlacesToVisit
