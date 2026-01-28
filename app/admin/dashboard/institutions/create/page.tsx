"use client";

import React, { useEffect, useState } from "react";
import CustomInput from "@/components/custom/customInput";
import CustomImageUpload from "@/components/custom/customImageUpload";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { map, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadToCloudinary } from "@/lib/utils/uploadToCloudinary";
import { useLoader } from "@/components/ui/Loader";
import GooglePlacesInput from "@/components/GooglePlacesInput";
import TextEditor from "@/components/static/textEditor";
import UniversitySelect from "@/components/custom/universitySelect";
import ParentUniversitySelect from "@/components/custom/universitySelect";
import axios from "axios";
import { useSearchParams } from "next/navigation";
// Zod schema including image required validation
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  emailDomain: z.string().min(1, "Email Domain is required"),
  contactEmail: z.string().email("Enter a valid email"),
  website: z.string().url("Enter a valid URL"),
  parentUniversity: z.string().optional(), // or z.string().nullable() if needed
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  image: z.instanceof(File, { message: "Image is required" }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  mapUrl: z.string().optional(),
});

const InputFields = [
  { name: "name", required: true, title: "Name", row: 1 },
  { name: "emailDomain", required: true, title: "Email Domain", row: 1 },
  { name: "contactEmail", required: true, title: "Contact Email", row: 1 },
  { name: "website", required: true, title: "Website", row: 1 },
  { name: "instagram", required: false, title: "Instagram", row: 2 },
  { name: "facebook", required: false, title: "Facebook", row: 2 },
  { name: "twitter", required: false, title: "Twitter", row: 2 },
  { name: "tiktok", required: false, title: "TikTok", row: 2 },
  { name: "youtube", required: false, title: "YouTube", row: 2 },
  { name: "linkedin", required: false, title: "LinkedIn", row: 2 },
];

const locationFields = [
  { name: "city", required: false, title: "City", row: 1, disabled: false },
  { name: "state", required: false, title: "State", row: 1, disabled: false },
  {
    name: "country",
    required: false,
    title: "Country",
    row: 1,
    disabled: false,
  },
  {
    name: "pincode",
    required: false,
    title: "Pincode",
    row: 1,
    disabled: false,
  },
  {
    name: "phone",
    required: false,
    title: "Phone Number",
    row: 2,
    disabled: false,
  },
  {
    name: "mapUrl",
    required: false,
    title: "Google Maps URL",
    row: 2,
    disabled: false,
  },
];

function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [editorHtml, setEditorHtml] = useState("");
  const [editorText, setEditorText] = useState("");
  const { showLoader, hideLoader, setProgress, resetProgress } = useLoader();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { image: undefined },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: any) => {
    showLoader();
    try {
      // Upload image and track progress
      const imageUrl = await uploadToCloudinary(data.image, setProgress);

      // Generate slug from name
      const slugRes = await fetch("/api/admin/institutions/generateSlug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });

      const slugData = await slugRes.json();
      if (!slugRes.ok) {
        throw new Error(slugData.error || "Failed to generate slug");
      }

      const slug = slugData.slug;

      // Build final payload
      const institutionData = {
        name: data.name,
        emailDomain: data.emailDomain,
        contactEmail: data.contactEmail,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        phone: data.phone,
        logo: imageUrl,
        slug,
        mapUrl: data.mapUrl,
        bio: editorText, // plain text version
        htmlBio: editorHtml, // HTML version (optional)
        parentUniversity: data.parentUniversity || null, // ObjectId string
        type: "institute",
        socialLinks: {
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          instagram: data.instagram || "",
          linkedin: data.linkedin || "",
          youtube: data.youtube || "",
        },
        location: {
          type: "Point",
          coordinates: [Number(data.longitude), Number(data.latitude)],
        },
      };

      console.log("Final Institution Payload:", institutionData);

      if (id) {
        // Update existing institution
        const res = await axios.put(
          `/api/admin/institutions/${id}`,
          institutionData,
        );
        console.log("Updated Institution:", res.data);
      } else {
        const res = await axios.post(
          "/api/admin/institutions",
          institutionData,
        );
        console.log("Created Institution:", res.data);
      }
    } catch (err) {
      console.error("Error during submission:", err);
    } finally {
      hideLoader();
    }
  };

  const urlToFile = async (url: string, fileName = "image.jpg") => {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  };

  useEffect(() => {
    if (id) {
      const fetchInstitution = async () => {
        showLoader();
        try {
          const { data } = await axios.get(`/api/admin/institutions/${id}`);

          const imageFile = await urlToFile(data.logo, "institution-logo.jpg");

          methods.reset({
            ...data,
            image: imageFile,
            longitude: Number(data.location.coordinates[0]),
            latitude: Number(data.location.coordinates[1]),
          });

          setEditorHtml(data.htmlBio);
          setEditorText(data.bio);
        } catch (error) {
          console.error("Failed to load institution data", error);
        } finally {
          hideLoader();
        }
      };

      fetchInstitution();
    }
  }, [id, methods, showLoader, hideLoader]);

  return (
    <section className="min-h-screen w-full text-center">
      <div className="py-10">
        <h1 className="custom-h1">
          {" "}
          {id ? "Edit Institution" : "Add Institution"}
        </h1>
        <p className="my-4 text-2xl">
          Create a new institution by filling out the form below.
        </p>
      </div>

      <div className="text-left">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 grid min-h-screen grid-cols-1 gap-4 divide-x border-t px-10 lg:grid-cols-2"
          >
            {/* Left Side */}
            <div className="space-y-6 py-10">
              <h2 className="my-4 px-4 font-Monument text-2xl">
                Institution Details
              </h2>

              {/* Custom image uploader */}
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <>
                    <CustomImageUpload
                      value={field.value}
                      onChange={(file) => field.onChange(file)}
                    />
                    {errors.image && (
                      <p className="mt-2 px-4 text-sm text-red-500">
                        {errors.image.message as string}
                      </p>
                    )}
                  </>
                )}
              />

              {InputFields.filter((i) => i.row === 1).map((input, id) => (
                <CustomInput
                  key={id}
                  name={input.name}
                  required={input.required}
                  title={input.title}
                />
              ))}

              <ParentUniversitySelect />

              <div className="!my-12 border"></div>

              <h2 className="my-4 px-4 font-Monument text-2xl">
                Location Details
              </h2>
              <p className="px-4 text-sm font-bold">
                Select your institution&apos;s address — we&apos;ll auto-fill
                city, state, country, and more.
              </p>
              <GooglePlacesInput
                name="address"
                title="Institution Address"
                required
              />

              {locationFields.map((input, id) => (
                <CustomInput
                  key={id}
                  name={input.name}
                  required={input.required}
                  title={input.title}
                  disabled={input.disabled}
                />
              ))}
            </div>

            {/* Right Side */}
            <div className="space-y-6 py-10">
              <h2 className="px-4 font-Monument text-2xl">Social Media</h2>
              {InputFields.filter((i) => i.row === 2).map((input, id) => (
                <CustomInput
                  key={id}
                  name={input.name}
                  required={input.required}
                  title={input.title}
                />
              ))}

              <div className="px-4">
                <div className="!my-12 border"></div>

                <h2 className="my-4 font-Monument text-2xl">
                  Institution Description
                </h2>
                <TextEditor
                  text={editorHtml}
                  setText={(html, plain) => {
                    setEditorHtml(html);
                    setEditorText(plain);
                  }}
                />
              </div>

              <div className="px-4">
                <button
                  type="submit"
                  className="rounded bg-primaryPurple px-6 py-2"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </section>
  );
}

export default Page;
