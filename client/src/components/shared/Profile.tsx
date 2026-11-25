
"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Camera,
  UserRound,
  Mail,
  MapPin,
  Save,
  Trash2,
  X,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

export interface IProfileUser {
  id: string;
  name: string;
  email: string;
  address?: string | null;
  image?: string | null;
  role?: string;
}

export interface IProfileUpdateData {
  name: string;
  address: string;
  image: File | null;
  removeImage: boolean;
}

interface ProfileProps {
  user: IProfileUser;
  onSave: (data: IProfileUpdateData) => Promise<void> | void;
  allowImageChange?: boolean;
}

export default function Profile({
  user,
  onSave,
  allowImageChange = true,
}: ProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState(user.address ?? "");
  const [imagePreview, setImagePreview] = useState(user.image ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setRemoveImage(false);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setName(user.name);
    setAddress(user.address ?? "");
    setImagePreview(user.image ?? "");
    setImageFile(null);
    setRemoveImage(false);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSave({
        name: name.trim(),
        address: address.trim(),
        image: imageFile,
        removeImage,
      });
    } catch {
      setError("Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = user.role
    ? user.role.replaceAll("-", " ")
    : "CivicPulse Member";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and profile photo.
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[#134E4A] to-[#0F766E]" />

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar */}
            <div className="relative h-28 w-28 shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-teal-50 shadow-md">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile photo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={48} className="text-teal-700" />
                )}
              </div>

              {allowImageChange && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Change profile photo"
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white bg-[#0F766E] text-white shadow-md transition hover:bg-[#115E59]"
                  >
                    <Camera size={18} />
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                        setRemoveImage(true);
                        setError("");
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      aria-label="Remove profile photo"
                      title="Remove profile photo"
                      className="absolute -bottom-2 left-0 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white bg-red-600 text-white shadow-md transition hover:bg-red-700"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* User Summary */}
            <div className="pb-1 sm:flex-1 sm:pl-2">
              <h2 className="text-xl font-bold text-slate-900">
                {user.name}
              </h2>
              <p className="mt-1 text-sm capitalize text-slate-500">
                {roleLabel}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:self-end">
              <ShieldCheck size={15} />
              Verified Account
            </div>
          </div>

          {allowImageChange && (
            <p className="mt-4 text-xs text-slate-400">
              JPG, PNG or WEBP. Maximum file size 5MB.
            </p>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Personal Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Update your name and contact information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Name */}
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Full Name <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="profile-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none"
              />
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              Email address cannot be changed here.
            </p>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label
              htmlFor="profile-address"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Address
            </label>

            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <textarea
                id="profile-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your present address"
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={17} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
