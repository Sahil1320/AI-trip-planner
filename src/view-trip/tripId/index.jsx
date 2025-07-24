import React,{useEffect} from 'react'
import { useParams } from 'react-router-dom';
import { db } from '@/service/firebaseConfig';
import {doc,getDoc} from 'firebase/firestore'
import { toast } from 'sonner';
import InfoSection from '../components/InfoSection';
import { useState } from 'react';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';
import Footer from '../components/Footer';

function Viewtrip() {

  const {tripId}=useParams();
  const [trip,setTrip]=useState([])

  useEffect(()=>{
    tripId&&GetTripData();

  },[tripId])

  /*
  use to get trip data from firebase

  */

  const GetTripData=async()=>{
    const docRef=doc(db,'AITrips',tripId)
    const docSnap=await getDoc(docRef);

    if(docSnap.exists()){
      console.log("Documents:",docSnap.data());
      setTrip(docSnap.data());
    }
    else{
      console.log("No Such Documents");
      toast('No trip found!')
    }
  }
  return (
    <div>
      {/* Information Section */}
      <InfoSection trip={trip}/>

      {/* Recommended Hotels */}
      <Hotels trip={trip}/>

      {/* Daily Plan */}
      <PlacesToVisit trip={trip}/>

      {/* Footer */}
      <Footer trip={trip} />
    </div>
  )
}

export default Viewtrip
