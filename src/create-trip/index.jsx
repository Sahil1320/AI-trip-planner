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
      await SaveAiTrip(rawText);
      toast("Trip generated!");
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
  if (
    !parsed.ok ||
    !parsed.data ||
    !parsed.data.itinerary?.length ||
    !parsed.data.hotelOptions?.length
  ) {
    console.error("Invalid Itinerary or Hotel Options", parsed.data);
    toast.error("Incomplete trip generated. Please try again.");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const docId = Date.now().toString();

  try {
    await setDoc(doc(db, "AITrips", docId), {
      userSelection: formData,
      tripData: parsed.data,
      rawAiText: null,
      userEmail: user?.email ?? null,
      id: docId,
      createdAt: new Date().toISOString(),
    });
    console.log("Trip saved:", docId);
    navigate('/view-trip/' + docId);
  } catch (err) {
    console.error("Firestore save failed:", err);
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
          <h2 className="text-xl my-3 font-medium">What is destination of choice?</h2>
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
            <DialogDescription>
              <img src="/logo.svg" alt="logo" />
              <h2 className="font-bold text-lg mt-7">Sign In with Google</h2>
              <p>Sign in to the App with Google authentication securely</p>
              <Button onClick={login} className="w-full mt-5 flex gap-4 items-center">
                <FcGoogle className="h-7 w-7" />
                Sign In with Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
