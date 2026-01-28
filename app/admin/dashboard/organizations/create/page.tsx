"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomInput from "@/components/custom/customInput";
import CustomImageUpload from "@/components/custom/customImageUpload";
import GooglePlacesInput from "@/components/GooglePlacesInput";
import TextEditor from "@/components/static/textEditor";
import { uploadToCloudinary } from "@/lib/utils/uploadToCloudinary";
import { useLoader } from "@/components/ui/Loader";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import OrgTypeSelect from "@/components/custom/OrganizationSelect";
import ContributionSelect from "@/components/custom/ContributionSelect";

// Schema for organization
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  emailDomain: z.string().optional(),
  contactEmail: z.string().email("Enter a valid email").optional(),
  website: z.string().url("Enter a valid URL").optional(),
  orgType: z.enum([
    "open-source",
    "non-profit",
    "corporate",
    "educational",
    "freelancer",
    "community",
  ]),
  contributionType: z.enum(["free", "paid", "both"]).optional(),
  image: z.instanceof(File, { message: "Image is required" }),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
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
  { name: "emailDomain", required: false, title: "Email Domain", row: 1 },
  { name: "contactEmail", required: false, title: "Contact Email", row: 1 },
  { name: "website", required: false, title: "Website", row: 1 },
  { name: "github", required: false, title: "GitHub", row: 2 },
  { name: "linkedin", required: false, title: "LinkedIn", row: 2 },
  { name: "twitter", required: false, title: "Twitter", row: 2 },
  { name: "facebook", required: false, title: "Facebook", row: 2 },
  { name: "instagram", required: false, title: "Instagram", row: 2 },
  { name: "youtube", required: false, title: "YouTube", row: 2 },
];

const locationFields = [
  { name: "city", required: false, title: "City", disabled: false },
  { name: "state", required: false, title: "State", disabled: false },
  { name: "country", required: false, title: "Country", disabled: false },
  { name: "pincode", required: false, title: "Pincode", disabled: false },
  { name: "phone", required: false, title: "Phone Number", disabled: false },
  {
    name: "mapUrl",
    required: false,
    title: "Google Maps URL",
    disabled: false,
  },
];

function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [editorHtml, setEditorHtml] = useState("");
  const [editorText, setEditorText] = useState("");
  const { showLoader, hideLoader, setProgress } = useLoader();

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { image: undefined },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: any) => {
    showLoader();
    try {
      const logoUrl = await uploadToCloudinary(data.image, setProgress);

      const slugRes = await fetch("/api/admin/organizations/generateSlug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });

      const slugData = await slugRes.json();
      if (!slugRes.ok)
        throw new Error(slugData.error || "Slug generation failed");

      const payload = {
        name: data.name,
        emailDomain: data.emailDomain,
        contactEmail: data.contactEmail,
        website: data.website,
        orgType: data.orgType,
        contributionType: data.contributionType || "free",
        logo: logoUrl,
        slug: slugData.slug,
        description: editorText,
        htmlDescription: editorHtml,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        phone: data.phone,
        mapUrl: data.mapUrl,
        socialLinks: {
          github: data.github,
          linkedin: data.linkedin,
          twitter: data.twitter,
          facebook: data.facebook,
          instagram: data.instagram,
          youtube: data.youtube,
        },
        location: {
          type: "Point",
          coordinates: [data.longitude, data.latitude],
        },
      };

      if (id) {
        await axios.put(`/api/admin/organizations/${id}`, payload);
      } else {
        await axios.post("/api/admin/organizations", payload);
      }
    } catch (error) {
      console.error("Submission Error:", error);
    } finally {
      hideLoader();
    }
  };

  const urlToFile = async (url: string, fileName = "logo.jpg") => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        showLoader();
        try {
          const { data } = await axios.get(`/api/admin/organizations/${id}`);
          const imageFile = await urlToFile(data.logo);

          reset({
            ...data,
            image: imageFile,
            latitude: data.location?.coordinates[1],
            longitude: data.location?.coordinates[0],
            ...data.socialLinks,
          });

          setEditorHtml(data.htmlDescription);
          setEditorText(data.description);
        } catch (err) {
          console.error("Error loading organization:", err);
        } finally {
          hideLoader();
        }
      };

      fetchData();
    }
  }, [id, reset, showLoader, hideLoader]);

  return (
    <section className="min-h-screen w-full text-center">
      <div className="py-10">
        <h1 className="custom-h1">
          {id ? "Edit Organization" : "Add Organization"}
        </h1>
        <p className="my-4 text-2xl">
          {id
            ? "Update details of the organization below."
            : "Fill in the form to create a new organization."}
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
                Organization Details
              </h2>

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

              <OrgTypeSelect />

              <ContributionSelect />

              <GooglePlacesInput name="address" title="Address" required />

              {locationFields.map((input, id) => (
                <CustomInput
                  key={id}
                  name={input.name}
                  required={false}
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
                  required={false}
                  title={input.title}
                />
              ))}

              <div className="px-4">
                <div className="!my-12 border"></div>
                <h2 className="my-4 font-Monument text-2xl">
                  Organization Description
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
                  className="rounded bg-primaryPurple px-6 py-2 text-white"
                >
                  {id ? "Update" : "Create"}
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
