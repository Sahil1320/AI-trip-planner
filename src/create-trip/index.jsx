import React, { useEffect, useState, useCallback } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Input } from "@/components/ui/input";
import { SelectBudgetOptions, SelectTravelsList, AI_PROMPT } from "@/constants/options";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { chatSession } from "@/service/AIModel";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../service/firebaseConfig.jsx";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

function stripTrailingCommas(str) {
  return str.replace(/,\s*([}\]])/g, "$1");
}

function extractJSONObject(str) {
  const start = str.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    const ch = str[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return str.slice(start, i + 1);
    }
  }
  return null;
}

function safeParseAIJSON(raw) {
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    const extracted = extractJSONObject(raw);
    if (extracted) {
      try {
        const cleaned = stripTrailingCommas(extracted);
        return { ok: true, data: JSON.parse(cleaned) };
      } catch {
        return { ok: false, data: null, raw };
      }
    }
    return { ok: false, data: null, raw };
  }
}

function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [formData, setFormData] = useState({
    location: null,
    noOfDays: "",
    budget: "",
    traveler: "",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate=useNavigate();

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log("formData:", formData);
  }, [formData]);

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => console.error(error),
  });

  const GetUserProfile = (tokenInfo) => {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo?.access_token}`,
            Accept: "Application/json",
          },
        }
      )
      .then((resp) => {
        localStorage.setItem("user", JSON.stringify(resp.data));
        setOpenDialog(false);
        OnGenerateTrip();
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  };

  const OnGenerateTrip = useCallback(async () => {
    if (loading) return;
    const user = localStorage.getItem("user");
    if (!user) {
      setOpenDialog(true);
      return;
    }
    const { location, noOfDays, budget, traveler } = formData;
    if (!location || !noOfDays || !budget || !traveler) {
      toast("Please fill all details.");
      return;
    }
    const daysNum = Number(noOfDays);
    if (Number.isNaN(daysNum) || daysNum < 1 || daysNum > 5) {
      toast("Days must be between 1 and 5.");
      return;
    }
    setLoading(true);
    try {
      const FINAL_PROMPT = `${AI_PROMPT
        .replaceAll("{location}", location?.label ?? "")
        .replaceAll("{totalDays}", daysNum)
        .replace("{traveler}", traveler)
        .replace("{budget}", budget)}\n\nReturn ONLY valid JSON.`;
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const rawText =
        typeof result?.response?.text === "function"
          ? await result.response.text()
          : result?.response?.text ?? "";
      console.log("-- RAW AI RESPONSE --\n", rawText);
      const savedDocId = await SaveAiTrip(rawText);
      if (savedDocId) {
        toast("Trip generated!");
        navigate('/view-trip/' + savedDocId);
      }
    } catch (err) {
      console.error("AI generation error:", err);
      toast("Failed to generate trip.");
    } finally {
      setLoading(false);
    }

  }, [loading, formData]);

  const SaveAiTrip = async (TripDataRaw) => {
  const parsed = safeParseAIJSON(TripDataRaw);

  // ✅ Validation check: If missing hotel or itinerary, show error and stop
  // Check multiple possible key names the AI might return
  const tripData = parsed.data;
  const itinerary = tripData?.itinerary || tripData?.dailyPlan || tripData?.daily_plan || tripData?.dailyItinerary;
  const hotels = tripData?.hotelOptions || tripData?.hotels || tripData?.hotel_options || tripData?.hotelRecommendations;

  if (
    !parsed.ok ||
    !tripData ||
    !itinerary?.length ||
    !hotels?.length
  ) {
    console.error("Invalid Itinerary or Hotel Options", tripData);
    console.error("Available keys:", tripData ? Object.keys(tripData) : "no data");
    toast.error("Incomplete trip generated. Please try again.");
    return null;
  }

  // Normalize the keys so the view-trip page always gets consistent data
  const normalizedData = {
    ...tripData,
    itinerary: itinerary,
    hotelOptions: hotels,
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const docId = Date.now().toString();

  try {
    await setDoc(doc(db, "AITrips", docId), {
      userSelection: formData,
      tripData: normalizedData,
      rawAiText: null,
      userEmail: user?.email ?? null,
      id: docId,
      createdAt: new Date().toISOString(),
    });
    console.log("Trip saved:", docId);
    return docId;
  } catch (err) {
    console.error("Firestore save failed:", err);
    toast.error("Failed to save trip. Please try again.");
    return null;
  }
};


  const isFormIncomplete = (() => {
    const { location, noOfDays, budget, traveler } = formData;
    const daysNum = Number(noOfDays);
    return (
      !location ||
      !noOfDays ||
      Number.isNaN(daysNum) ||
      daysNum < 1 ||
      daysNum > 5 ||
      !budget ||
      !traveler
    );
  })();

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10">
      <h2 className="font-bold text-3xl">Tell us your travel preferences 🏕️🌴</h2>
      <p className="mt-3 text-gray-500 text-xl">
        Just provide some basic information, and our trip planner will generate
        a customized itinerary.
      </p>

      <div className="mt-20 flex flex-col gap-10">
        <div>
          <div className="flex justify-between items-center my-3">
            <h2 className="text-xl font-medium">What is destination of choice?</h2>
            <button
              type="button"
              onClick={() => {
                setManualMode((prev) => !prev);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
            >
              {manualMode ? "🔍 Use Google Places Search" : "✏️ Enter Destination Manually"}
            </button>
          </div>

          {manualMode ? (
            <div className="flex flex-col gap-3">
              <Input
                placeholder="e.g. Paris, France or Tokyo, Japan"
                value={manualLocation}
                onChange={(e) => {
                  const val = e.target.value;
                  setManualLocation(val);
                  const locObj = val.trim() ? { label: val.trim(), value: { description: val.trim() } } : null;
                  setPlace(locObj);
                  handleInputChange("location", locObj);
                }}
              />
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500">Popular:</span>
                {[
                  "Paris, France",
                  "Tokyo, Japan",
                  "New York, USA",
                  "Rome, Italy",
                  "Bali, Indonesia",
                  "Dubai, UAE",
                  "London, UK",
                ].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setManualLocation(city);
                      const locObj = { label: city, value: { description: city } };
                      setPlace(locObj);
                      handleInputChange("location", locObj);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      manualLocation === city
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
                selectProps={{
                  value: place,
                  onChange: (v) => {
                    setPlace(v);
                    handleInputChange("location", v);
                  },
                }}
              />
              <p className="text-xs text-gray-400 mt-2">
                Tip: If autocomplete shows "No options", click <button type="button" onClick={() => setManualMode(true)} className="text-blue-600 underline font-medium cursor-pointer">Enter Destination Manually</button> above.
              </p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl my-3 font-medium">How many days are you planning your trip?</h2>
          <Input
            placeholder="1-5"
            type="number"
            min={1}
            max={5}
            value={formData.noOfDays}
            onChange={(e) => handleInputChange("noOfDays", e.target.value)}
            onWheel={(e) => e.currentTarget.blur()} // prevents scroll change
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl my-3 font-medium">What is Your Budget?</h2>
        <div className="grid grid-cols-3 gap-5 mt-5">
          {SelectBudgetOptions.map((item) => (
            <div
              key={item.title}
              onClick={() => handleInputChange("budget", item.title)}
              className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${
                formData?.budget === item.title ? "shadow-lg border-black" : ""
              }`}
            >
              <h2 className="text-4xl">{item.icon}</h2>
              <h2 className="font-bold text-lg">{item.title}</h2>
              <h2 className="text-sm text-gray-500">{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl my-3 font-medium">
          Who do you plan on traveling with on your next adventure?
        </h2>
        <div className="grid grid-cols-3 gap-5 mt-5">
          {SelectTravelsList.map((item) => (
            <div
              key={item.title}
              onClick={() => handleInputChange("traveler", item.people)}
              className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${
                formData?.traveler === item.people ? "shadow-lg border-black" : ""
              }`}
            >
              <h2 className="text-4xl">{item.icon}</h2>
              <h2 className="font-bold text-lg">{item.title}</h2>
              <h2 className="text-sm text-gray-500">{item.desc}</h2>
            </div>
          ))}
        </div>
      </div>

      <div className="my-10 justify-end flex">
        <Button disabled={loading || isFormIncomplete} onClick={OnGenerateTrip}>
          {loading ? <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" /> : "Generate Trip"}
        </Button>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle asChild>
              <div>
                <img src="/logo.svg" alt="logo" />
                <h2 className="font-bold text-lg mt-7">Sign In with Google</h2>
              </div>
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                <span className="block mb-4 text-sm text-gray-500">Sign in to the App with Google authentication securely</span>
                <Button onClick={login} className="w-full mt-5 flex gap-4 items-center">
                  <FcGoogle className="h-7 w-7" />
                  Sign In with Google
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
