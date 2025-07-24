export const SelectTravelsList = [
  {
    id: 1,
    title: 'Just Me',
    desc: 'A sole travels in exploration',
    icon: '👤',
    people: '1'
  },
  {
    id: 2,
    title: 'A Couple',
    desc: 'Two travels in tandem',
    icon: '👫',
    people: '2 People'
  },
  {
    id: 3,
    title: 'Family',
    desc: 'A group of fun loving adv',
    icon: '👨‍👩‍👧‍👦',
    people: '3 to 5 People'
  },
  {
  id: 4,
  title: 'Friends',
  desc: 'A bunch of thrill-seekes',
  icon: '🤗',
  people: '5 to 10 People'
}

];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: 'Cheap',
    desc: 'Stay conscious of costs',
    icon: '💸',
  },
  {
    id: 2,
    title: 'Moderate',
    desc: 'Keep cost on the average side',
    icon: '💰',
  },
  {
    id: 3,
    title: 'Luxury',
    desc: 'Indulge in premium experiences',
    icon: '🪙',
  }
];

export const AI_PROMPT = `
Generate a travel plan for Location: {location}, for {totalDays} days for {traveler} with a {budget} budget.
Return ONLY valid JSON in this format:
{
  "hotelOptions": [
    {
      "hotelName": "string",
      "hotelAddress": "string",
      "price": "string",
      "hotelImageUrl": "string",
      "geoCoordinates": { "latitude": number, "longitude": number },
      "rating": number,
      "description": "string"
    },
    {
      "hotelName": "string",
      "hotelAddress": "string",
      "price": "string",
      "hotelImageUrl": "string",
      "geoCoordinates": { "latitude": number, "longitude": number },
      "rating": number,
      "description": "string"
    },
    {
      "hotelName": "string",
      "hotelAddress": "string",
      "price": "string",
      "hotelImageUrl": "string",
      "geoCoordinates": { "latitude": number, "longitude": number },
      "rating": number,
      "description": "string"
    }
  ],
  "itinerary": [
    {
      "day": number,
      "places": [
        {
          "placeName": "string",
          "placeDetails": "string",
          "placeImageUrl": "string",
          "geoCoordinates": { "latitude": number, "longitude": number },
          "ticketPricing": "string",
          "rating": number,
          "timeTravel": "string",
          "bestTimeToVisit": "string"
        }
      ]
    }
  ]
}
Generate at least 3 to 5 unique hotels in the hotelOptions array.
`;
