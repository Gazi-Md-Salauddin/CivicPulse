"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Construction,
  Droplets,
  Footprints,
  Lightbulb,
  MapPin,
  Navigation,
  Search,
  Trash2,
  UploadCloud,
  Waves,
} from "lucide-react";

import { createIssue } from "@/services/issue.service";
import type { ICreateIssue } from "@/types/issue.types";
import { uploadIssueImages } from "@/services/issue-image.service";
import LocationPicker from "@/components/map/LocationPicker";
import type { MapCoordinate } from "@/components/map/types";
import { isValidMapCoordinate } from "@/components/map/types";
import {
  searchIssueLocations,
  type AddressSearchResult,
} from "@/services/location.service";

const initialMapView: MapCoordinate = { latitude: 0, longitude: 0 };

function getCoordinatePair(
  latitude: string,
  longitude: string
): MapCoordinate | null {
  if (!latitude.trim() || !longitude.trim()) {
    return null;
  }

  const coordinate = {
    latitude: Number(latitude),
    longitude: Number(longitude),
  };

  return isValidMapCoordinate(coordinate) ? coordinate : null;
}

// Issue Categories
const categories = [
  {
    name: "Road Damage",
    value: "road_damage",
    description: "Potholes, broken roads",
    icon: Construction,
  },
  {
    name: "Streetlight",
    value: "streetlight",
    description: "Broken or missing lights",
    icon: Lightbulb,
  },
  {
    name: "Drainage",
    value: "drainage",
    description: "Blocked drains, flooding",
    icon: Droplets,
  },
  {
    name: "Footpath",
    value: "footpath",
    description: "Damaged sidewalks",
    icon: Footprints,
  },
  {
    name: "Waste Management",
    value: "waste_management",
    description: "Garbage and waste issues",
    icon: Trash2,
  },
  {
    name: "Public Infrastructure",
    value: "public_infrastructure",
    description: "Other public facilities",
    icon: Waves,
  },
] as const;

export default function CreateIssuePage() {
  const [category, setCategory] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [mapCenter, setMapCenter] = useState(initialMapView);
  const [mapZoom, setMapZoom] = useState(2);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<AddressSearchResult[]>([]);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const addressSearchAbortRef = useRef<AbortController | null>(null);
  const selectedCoordinates = getCoordinatePair(latitude, longitude);

  const setSelectedLocation = (coordinate: MapCoordinate) => {
    setLatitude(String(coordinate.latitude));
    setLongitude(String(coordinate.longitude));
    setMapCenter(coordinate);
    setLocationError("");
    setError("");
  };

  // Handle Image Selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const available = Math.max(0, 5 - images.length);
    const selected = files.slice(0, available);

    setImages((prev) => [...prev, ...selected]);

    setPreviews((prev) => [
      ...prev,
      ...selected.map((file) => URL.createObjectURL(file)),
    ]);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // Remove Selected Image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));

    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Get Current GPS Location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationError("");
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        if (!isValidMapCoordinate(coordinate)) {
          setLocationError("Your browser returned invalid coordinates.");
          setLocationLoading(false);
          return;
        }

        setSelectedLocation(coordinate);
        setMapZoom(15);
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location permission was denied.");
            break;

          case err.POSITION_UNAVAILABLE:
            setLocationError("Your current location is unavailable.");
            break;

          case err.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;

          default:
            setLocationError("Unable to get your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleAddressSearch = async () => {
    const query = addressQuery.trim();

    if (query.length < 3 || query.length > 200) {
      setAddressSearchError("Enter an address between 3 and 200 characters.");
      setAddressResults([]);
      return;
    }

    addressSearchAbortRef.current?.abort();
    const controller = new AbortController();
    addressSearchAbortRef.current = controller;
    setAddressSearchLoading(true);
    setAddressSearchError("");
    setAddressResults([]);

    try {
      const results = await searchIssueLocations(query, controller.signal);
      setAddressResults(results);
      if (results.length === 0) {
        setAddressSearchError("No matching addresses were found.");
      }
    } catch (searchError) {
      if (!controller.signal.aborted) {
        setAddressSearchError(
          searchError instanceof Error
            ? searchError.message
            : "Address search failed. Please try again."
        );
      }
    } finally {
      if (addressSearchAbortRef.current === controller) {
        addressSearchAbortRef.current = null;
        setAddressSearchLoading(false);
      }
    }
  };

  const handleAddressSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleAddressSearch();
    }
  };

  const handleAddressResultSelect = (result: AddressSearchResult) => {
    setLocationAddress(result.displayName);
    setSelectedLocation({
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setMapZoom(15);
    setAddressResults([]);
    setAddressSearchError("");
  };

  const handleClearLocation = () => {
    addressSearchAbortRef.current?.abort();
    addressSearchAbortRef.current = null;
    setLocationAddress("");
    setAddressQuery("");
    setAddressResults([]);
    setAddressSearchLoading(false);
    setAddressSearchError("");
    setLocationError("");
    setError("");
    setLatitude("");
    setLongitude("");
    setMapCenter(initialMapView);
    setMapZoom(2);
  };

  const handleCoordinateInput = (
    nextLatitude: string,
    nextLongitude: string
  ) => {
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);

    if (!nextLatitude.trim() || !nextLongitude.trim()) {
      return;
    }

    const coordinate = {
      latitude: Number(nextLatitude),
      longitude: Number(nextLongitude),
    };

    if (isValidMapCoordinate(coordinate)) {
      setMapCenter(coordinate);
      setMapZoom(15);
    }
  };

  // Clear Form
  const handleClearForm = (form: HTMLFormElement) => {
    addressSearchAbortRef.current?.abort();
    addressSearchAbortRef.current = null;
    form.reset();

    setCategory("");
    setImages([]);

    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setPreviews([]);

    setLatitude("");
    setLongitude("");
    setLocationAddress("");
    setAddressQuery("");
    setAddressResults([]);
    setAddressSearchLoading(false);
    setAddressSearchError("");
    setLocationError("");
    setMapCenter(initialMapView);
    setMapZoom(2);

    setError("");
    setSuccess("");
  };

  // Submit Issue
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!category) {
      setError("Please select an issue category.");
      return;
    }

    const title = String(formData.get("title") || "").trim();
    const description = String(
      formData.get("description") || ""
    ).trim();

    const address = locationAddress.trim();

    if (!title || !description || !address) {
      setError("Please fill in all required fields.");
      return;
    }

    const hasLatitude = latitude.trim().length > 0;
    const hasLongitude = longitude.trim().length > 0;

    if (hasLatitude !== hasLongitude) {
      setError("Provide both latitude and longitude, or clear the location.");
      return;
    }

    let coordinates: MapCoordinate | undefined;
    if (hasLatitude && hasLongitude) {
      coordinates = {
        latitude: Number(latitude),
        longitude: Number(longitude),
      };

      if (!isValidMapCoordinate(coordinates)) {
        setError("Please enter valid latitude and longitude values.");
        return;
      }
    }

    const issueData: ICreateIssue = {
      title,
      description,
      category: category as ICreateIssue["category"],
      location_address: address,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    };

    try {
      setLoading(true);

      // Step 1: Create Issue
      const result = await createIssue(issueData);

      // Step 2: Get newly created issue ID
      const issueId = (result.data as { id: string }).id;

      // Step 3: Upload images if selected
      if (images.length > 0) {
        await uploadIssueImages(issueId, images);
      }

      // Step 4: Success
      setSuccess("Issue reported successfully!");

      handleClearForm(form);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to report issue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-7 px-2 pb-10">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-teal-700">Report an Issue</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Report an Issue
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Help make your community better. Report an infrastructure
            problem and let the right department take action.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 sm:flex">
          <span className="size-2 rounded-full bg-teal-500" />
          <span className="text-xs font-semibold text-teal-800">
            Citizen Portal
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#134E4A] via-[#0F766E] to-[#0D9488] p-6 text-white sm:p-8">
        <div className="relative z-10 max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-50">
            <AlertCircle size={14} />
            Community improvement starts with you
          </div>

          <h2 className="text-xl font-bold sm:text-2xl">
            See a problem? Report it.
          </h2>

          <p className="mt-2 text-sm leading-6 text-teal-50/85">
            Share the details, add a photo, and pinpoint the location.
            We will help get it to the right team.
          </p>
        </div>

        <MapPin className="absolute -right-5 -bottom-12 size-52 rotate-12 text-white/10" />
        <div className="absolute -right-10 -top-16 size-52 rounded-full border border-white/10" />
        <div className="absolute right-20 -bottom-28 size-64 rounded-full border border-white/10" />
      </div>

      {/* API Feedback */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={19} className="shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 01: Issue Details */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Construction size={21} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800">Issue Details</h2>
                <span className="text-xs text-slate-400">01</span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Tell us what needs attention
              </p>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-7">

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Issue Title <span className="text-red-500">*</span>
              </label>

              <input
                name="title"
                required
                type="text"
                maxLength={200}
                placeholder="e.g. Large pothole on Mirpur main road"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
              />
            </div>

            {/* Category */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Issue Category <span className="text-red-500">*</span>
                </label>

                <p className="mt-1 text-xs text-slate-400">
                  Select the category that best describes the problem.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((item) => {
                  const Icon = item.icon;
                  const active = category === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={`group relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${active
                          ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/10"
                          : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/40"
                        }`}
                    >
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition ${active
                            ? "bg-teal-700 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-700"
                          }`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold ${active ? "text-teal-800" : "text-slate-700"
                            }`}
                        >
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {item.description}
                        </p>
                      </div>

                      {active && (
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-teal-700"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>

              <textarea
                name="description"
                required
                rows={5}
                placeholder="Describe what happened, where it occurred, how severe it is, and how it affects people in the area..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
              />

              <p className="text-right text-xs text-slate-400">
                Provide clear and accurate information.
              </p>
            </div>
          </div>
        </section>

        {/* Section 02: Attachments */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Camera size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">Issue Photos</h2>
              <p className="mt-1 text-xs text-slate-500">
                Visual evidence helps us understand the issue
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={images.length >= 5}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-4 py-9 text-center transition hover:border-teal-500 hover:bg-teal-50/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <UploadCloud size={27} />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                Click to upload images
              </p>

              <p className="mt-2 text-xs text-slate-400">
                PNG, JPG or WEBP · Maximum 5 images
              </p>

              <span className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white">
                Browse Files
              </span>
            </button>

            {previews.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {previews.map((src, index) => (
                  <div
                    key={src}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img
                      src={src}
                      alt={`Issue attachment ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label="Remove image"
                      className="absolute right-2 top-2 rounded-lg bg-black/60 p-2 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-slate-400">
              {images.length} of 5 images selected
            </p>
          </div>
        </section>

        {/* Section 03: Location */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <MapPin size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">Issue Location</h2>

              <p className="mt-1 text-xs text-slate-500">
                Help the responsible team find the exact location
              </p>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-7">

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Location Address <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

                <input
                  name="location_address"
                  required
                  type="text"
                  value={locationAddress}
                  onChange={(event) => setLocationAddress(event.target.value)}
                  maxLength={500}
                  placeholder="Enter street, area, city or nearby landmark"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                />
              </div>
            </div>

            {/* Address search */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Search for an address
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Search public addresses only. Search runs only when you press
                  the button; there is no autocomplete.
                  {" "}Search data ©{" "}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    OpenStreetMap contributors
                  </a>
                  .
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="search"
                  value={addressQuery}
                  onChange={(event) => {
                    setAddressQuery(event.target.value);
                    setAddressResults([]);
                    setAddressSearchError("");
                  }}
                  onKeyDown={handleAddressSearchKeyDown}
                  maxLength={200}
                  placeholder="Search a street, area or landmark"
                  aria-label="Search for a public address"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                />
                <button
                  type="button"
                  onClick={() => void handleAddressSearch()}
                  disabled={addressSearchLoading || addressQuery.trim().length < 3}
                  className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search size={16} />
                  {addressSearchLoading ? "Searching..." : "Search"}
                </button>
              </div>

              {addressSearchError && (
                <p className="text-sm text-red-700" role="alert">
                  {addressSearchError}
                </p>
              )}

              {addressResults.length > 0 && (
                <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                  {addressResults.map((result, index) => (
                    <li key={`${result.latitude}-${result.longitude}-${index}`}>
                      <button
                        type="button"
                        onClick={() => handleAddressResultSelect(result)}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-teal-50 focus-visible:bg-teal-50 focus-visible:outline-none"
                      >
                        {result.displayName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* GPS and location actions */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Select the issue location
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Click the map or drag the pin. GPS is optional.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 disabled:opacity-50"
                >
                  <Navigation size={16} />
                  {locationLoading ? "Getting Location..." : "Current Location"}
                </button>
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Trash2 size={15} />
                  Clear Location
                </button>
              </div>
            </div>

            {locationLoading && (
              <p className="text-sm text-teal-800" role="status">
                Waiting for your device location...
              </p>
            )}
            {locationError && (
              <p className="text-sm text-red-700" role="alert">
                {locationError}
              </p>
            )}

            {/* Latitude & Longitude */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">
                  Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={(event) =>
                    handleCoordinateInput(event.target.value, longitude)
                  }
                  placeholder="Select on map or use GPS"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500">
                  Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={(event) =>
                    handleCoordinateInput(latitude, event.target.value)
                  }
                  placeholder="Select on map or use GPS"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">
                  {selectedCoordinates
                    ? `${selectedCoordinates.latitude.toFixed(6)}, ${selectedCoordinates.longitude.toFixed(6)}`
                    : "No coordinates selected"}
                </p>
                <p className="text-xs text-slate-400">
                  Moving the pin does not automatically change the address.
                </p>
              </div>
              <LocationPicker
                position={selectedCoordinates}
                center={mapCenter}
                onChange={setSelectedLocation}
                zoom={mapZoom}
              />
            </div>
          </div>
        </section>

        {/* Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />

          <p className="text-xs leading-5 text-amber-800">
            Please make sure the information is accurate. Your report
            will be submitted for review by the responsible department.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={loading}
            onClick={(e) => {
              const form = e.currentTarget.closest("form");

              if (form) {
                handleClearForm(form);
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <ArrowLeft size={17} />
            Clear Form
          </button>

          <button
            type="submit"
            disabled={!category || loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Report"}

            {!loading && <ArrowRight size={17} />}
          </button>
        </div>
      </form>
    </div>
  );
}
