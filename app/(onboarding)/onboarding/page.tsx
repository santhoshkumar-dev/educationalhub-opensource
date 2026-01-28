// @ts-nocheck
"use client";

import * as React from "react";
import { useRouter } from "@bprogress/next/app";
import Image from "next/image";
import { completeOnboarding } from "./_actions";
import { useState, useCallback } from "react";
import InstitutionSearchSelect from "@/components/custom/InstitutionSearchSelect";
import OrganizationSearchSelect from "@/components/custom/OrganizationSearchSelect";
import ThemedSteps from "@/components/ui/themed-steps";
import { motion, AnimatePresence } from "framer-motion";
import { useMongoUser } from "@/app/context/UserContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Card, CardBody, Chip, Spinner } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";

// Types
interface Category {
  _id: string;
  title: string;
  description: string;
  img: string;
  slug: string;
}

interface Interest {
  categoryId: string;
  categoryName: string;
}

// Zod schema for form validation
const onboardingSchema = z
  .object({
    role: z.enum(["user", "instructor"], {
      required_error: "Please select a role",
    }),
    firstName: z.string().min(1, "First name is required").trim(),
    lastName: z.string().min(1, "Last name is required").trim(),
    interests: z
      .array(
        z.object({
          categoryId: z.string(),
          categoryName: z.string(),
        }),
      )
      .min(1, "Please select at least one interest")
      .max(5, "Maximum 5 interests allowed"),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    institution: z.any().optional(),
    organization: z.any().optional(),
  })
  .refine(
    (data) => {
      // For instructors, institution and organization are required
      if (data.role === "instructor") {
        return data.institution && data.organization;
      }
      return true;
    },
    {
      message: "Institution and organization are required for instructors",
      path: ["institution"],
    },
  );

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingComponent() {
  const currentUser = useMongoUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Initialize React Hook Form with Zod validation
  const methods = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "user",
      firstName: "",
      lastName: "",
      interests: [],
      instagram: "",
      facebook: "",
      twitter: "",
      website: "",
      linkedin: "",
      institution: null,
      organization: null,
    },
    mode: "onChange",
  });

  const {
    control,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = methods;

  // Watch form values
  const role = watch("role");
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const interests = watch("interests");
  const institution = watch("institution");
  const organization = watch("organization");

  // Initialize form fields when currentUser data is available
  React.useEffect(() => {
    if (currentUser) {
      setValue("firstName", currentUser.first_name || "");
      setValue("lastName", currentUser.last_name || "");
      setValue("instagram", currentUser.instagram || "");
      setValue("facebook", currentUser.facebook || "");
      setValue("twitter", currentUser.twitter || "");
      setValue("website", currentUser.website || "");
      setValue("linkedin", currentUser.linkedin || "");
    }
  }, [currentUser, setValue]);

  // Fetch categories when reaching interests step
  React.useEffect(() => {
    if (currentStep === 2 && categories.length === 0) {
      fetchCategories();
    }
  }, [currentStep, categories.length, fetchCategories]);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch("/api/category?limit=100");
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const handleCategoryToggle = (category: Category) => {
    const currentInterests = interests || [];
    const isSelected = currentInterests.some(
      (interest) => interest.categoryId === category._id,
    );

    if (isSelected) {
      setValue(
        "interests",
        currentInterests.filter(
          (interest) => interest.categoryId !== category._id,
        ),
      );
    } else {
      if (currentInterests.length < 5) {
        setValue("interests", [
          ...currentInterests,
          { categoryId: category._id, categoryName: category.title },
        ]);
      }
    }
  };

  const steps = [
    {
      title: "Select Role",
      description: "Choose your role",
    },
    {
      title: "Personal Info",
      description: "Enter your name",
    },
    {
      title: "Interests",
      description: "Select your interests",
    },
    {
      title: "Social Links",
      description: "Add social media (optional)",
    },
    {
      title: "Select Institution",
      description: "Choose your institution",
    },
    {
      title: "Select Organization",
      description: "Choose your organization",
    },
  ];

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0:
        return await trigger("role");
      case 1:
        return await trigger(["firstName", "lastName"]);
      case 2:
        return await trigger("interests");
      case 3:
        // Social media links are optional, no validation needed
        return true;
      case 4:
        if (role === "instructor") {
          return await trigger("institution");
        }
        return true;
      case 5:
        if (role === "instructor") {
          return await trigger("organization");
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      // For user role, skip institution and organization steps
      if (role === "user" && currentStep === 3) {
        // Social step is the last step for users, don't advance
        return;
      } else if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("role", data.role);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("interests", JSON.stringify(data.interests));
      formData.append("instagram", data.instagram || "");
      formData.append("facebook", data.facebook || "");
      formData.append("twitter", data.twitter || "");
      formData.append("website", data.website || "");
      formData.append("linkedin", data.linkedin || "");

      if (data.role === "instructor") {
        formData.append("institutionId", data.institution?._id || "");
        formData.append("organizationId", data.organization?._id || "");
      }

      const res = await completeOnboarding(formData);

      if (res?.message?.onboardingComplete) {
        router.push("/");
      }

      if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return role !== "";
      case 1:
        return firstName?.trim() !== "" && lastName?.trim() !== "";
      case 2:
        return interests && interests.length > 0 && interests.length <= 5;
      case 3:
        return true; // Social media is optional
      case 4:
        return role === "user" || institution !== null;
      case 5:
        return role === "user" || organization !== null;
      default:
        return false;
    }
  };

  const isLastStep = () => {
    if (role === "user") {
      return currentStep === 3; // Social step is last for users
    } else {
      return currentStep === steps.length - 1; // Organization step is last for instructors
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="min-h-screen px-4 py-12">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Let&apos;s set up your account to get started
              </p>
            </div>

            {/* Steps */}
            <ThemedSteps
              steps={role === "user" ? steps.slice(0, 4) : steps}
              currentStep={currentStep}
              hideProgressBars={false}
            />

            {/* Form Content */}
            <div className="mx-auto mt-4 max-w-2xl">
              <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step 0: Role Selection */}
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                            What&apos;s your role?
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">
                            This helps us personalize your experience
                          </p>
                        </div>

                        <Controller
                          name="role"
                          control={control}
                          render={({ field }) => (
                            <div className="space-y-4">
                              <div
                                onClick={() => field.onChange("user")}
                                className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                                  field.value === "user"
                                    ? "border-[#01ffca] bg-[#01ffca]/10"
                                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`h-4 w-4 rounded-full border-2 ${
                                      field.value === "user"
                                        ? "border-[#01ffca] bg-[#01ffca]"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {field.value === "user" && (
                                      <div className="mx-auto mt-0.5 h-2 w-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      Student/Learner
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      I&apos;m here to learn and take courses
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div
                                className={`cursor-not-allowed rounded-lg border-2 border-gray-200 p-4 opacity-50 transition-all duration-200 dark:border-gray-600`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`h-4 w-4 rounded-full border-2 border-gray-300`}
                                  ></div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      Instructor/Teacher
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      I want to create and teach courses
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* <div
                                onClick={() => field.onChange("instructor")}
                                className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                                  field.value === "instructor"
                                    ? "border-[#01ffca] bg-[#01ffca]/10"
                                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`h-4 w-4 rounded-full border-2 ${
                                      field.value === "instructor"
                                        ? "border-[#01ffca] bg-[#01ffca]"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {field.value === "instructor" && (
                                      <div className="mx-auto mt-0.5 h-2 w-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      Instructor/Teacher
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      I want to create and teach courses
                                    </p>
                                  </div>
                                </div>
                              </div> */}
                            </div>
                          )}
                        />

                        {errors.role && (
                          <p className="text-sm text-red-500">
                            {errors.role.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Step 1: Personal Info (Name) */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                            Tell us your name
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">
                            This information will be displayed on your profile
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="firstName"
                              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              First Name *
                            </label>
                            <Controller
                              name="firstName"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  id="firstName"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#01ffca] focus:outline-none focus:ring-1 focus:ring-[#01ffca] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                  placeholder="Enter your first name"
                                />
                              )}
                            />
                            {errors.firstName && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.firstName.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="lastName"
                              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Last Name *
                            </label>
                            <Controller
                              name="lastName"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  id="lastName"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#01ffca] focus:outline-none focus:ring-1 focus:ring-[#01ffca] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                  placeholder="Enter your last name"
                                />
                              )}
                            />
                            {errors.lastName && (
                              <p className="mt-1 text-sm text-red-500">
                                {errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Interests Selection */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                            What are you interested in?
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">
                            Select up to 5 topics you&apos;re interested like to
                            learn about. We&apos;ll use this to recommend
                            courses just for you.
                          </p>
                        </div>

                        {loadingCategories ? (
                          <div className="flex items-center justify-center py-12">
                            <Spinner size="lg" color="primary" />
                          </div>
                        ) : (
                          <>
                            <div className="mb-6 grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto pr-2 md:grid-cols-3">
                              {categories.map((category) => {
                                const isSelected = interests?.some(
                                  (interest) =>
                                    interest.categoryId === category._id,
                                );
                                return (
                                  <Card
                                    key={category._id}
                                    isPressable
                                    onPress={() =>
                                      handleCategoryToggle(category)
                                    }
                                    className={`relative cursor-pointer transition-all ${
                                      isSelected
                                        ? "border-2 border-[#01ffca] bg-[#01ffca]/20 dark:bg-[#01ffca]/10"
                                        : "border-2 border-transparent bg-gray-100 hover:border-gray-300 dark:bg-gray-700 dark:hover:border-gray-600"
                                    }`}
                                  >
                                    <CardBody className="p-4">
                                      {isSelected && (
                                        <div className="absolute right-2 top-2">
                                          <CheckCircle2 className="h-5 w-5 text-[#01ffca]" />
                                        </div>
                                      )}
                                      <Image
                                        src={category.img}
                                        alt={category.title}
                                        className="mb-2 h-24 w-full rounded-md object-cover"
                                        width={200}
                                        height={96}
                                      />
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {category.title}
                                      </h4>
                                    </CardBody>
                                  </Card>
                                );
                              })}
                            </div>

                            <div className="mb-4">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Selected: {interests?.length || 0}/5
                              </p>
                              {interests && interests.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {interests.map((interest) => (
                                    <Chip
                                      key={interest.categoryId}
                                      onClose={() => {
                                        setValue(
                                          "interests",
                                          interests.filter(
                                            (i) =>
                                              i.categoryId !==
                                              interest.categoryId,
                                          ),
                                        );
                                      }}
                                      variant="flat"
                                      color="primary"
                                    >
                                      {interest.categoryName}
                                    </Chip>
                                  ))}
                                </div>
                              )}
                            </div>

                            {errors.interests && (
                              <p className="text-sm text-red-500">
                                {errors.interests.message}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Step 3: Social Media Links (Optional) */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                            Connect your social media
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">
                            Add your social media profiles (optional - you can
                            skip this step)
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="instagram"
                              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Instagram
                            </label>
                            <Controller
                              name="instagram"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  id="instagram"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#01ffca] focus:outline-none focus:ring-1 focus:ring-[#01ffca] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                  placeholder="https://instagram.com/username"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="linkedin"
                              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              LinkedIn
                            </label>
                            <Controller
                              name="linkedin"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  id="linkedin"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#01ffca] focus:outline-none focus:ring-1 focus:ring-[#01ffca] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                  placeholder="https://linkedin.com/in/username"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="twitter"
                              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Twitter
                            </label>
                            <Controller
                              name="twitter"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  id="twitter"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#01ffca] focus:outline-none focus:ring-1 focus:ring-[#01ffca] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                  placeholder="https://twitter.com/username"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="facebook"
                              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Facebook
                            </label>
                            <Controller
                              name="facebook"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  id="facebook"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#01ffca] focus:outline-none focus:ring-1 focus:ring-[#01ffca] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                  placeholder="https://facebook.com/username"
                                />
                              )}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="website"
                              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              Website
                            </label>
                            <Controller
                              name="website"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  id="website"
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#01ffca] focus:outline-none focus:ring-1 focus:ring-[#01ffca] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                  placeholder="https://yourwebsite.com"
                                />
                              )}
                            />
                          </div>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            💡 You can skip this step and add social media links
                            later from your profile settings
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Institution Selection */}
                    {currentStep === 4 && role === "instructor" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                            Select your institution
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">
                            Choose the educational institution you&apos;re
                            affiliated with
                          </p>
                        </div>

                        <Controller
                          name="institution"
                          control={control}
                          render={({ field }) => (
                            <InstitutionSearchSelect
                              selected={field.value}
                              setSelected={field.onChange}
                            />
                          )}
                        />

                        {errors.institution && (
                          <p className="text-sm text-red-500">
                            {errors.institution.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Step 5: Organization Selection */}
                    {currentStep === 5 && role === "instructor" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                            Select your organization
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">
                            Choose the organization you represent
                          </p>
                        </div>

                        <Controller
                          name="organization"
                          control={control}
                          render={({ field }) => (
                            <OrganizationSearchSelect
                              selected={field.value}
                              setSelected={field.onChange}
                            />
                          )}
                        />

                        {errors.organization && (
                          <p className="text-sm text-red-500">
                            {errors.organization.message}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Error Display */}
                {error && (
                  <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
                      currentStep === 0
                        ? "cursor-not-allowed text-gray-400"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    }`}
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={isLastStep() ? handleSubmit(onSubmit) : handleNext}
                    disabled={!canProceed() || isLoading}
                    className={`rounded-lg px-8 py-3 font-medium transition-all duration-200 ${
                      canProceed() && !isLoading
                        ? "bg-[#01ffca] text-black shadow-lg shadow-[#01ffca]/25 hover:bg-[#01ffca]/90"
                        : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        <span>Processing...</span>
                      </div>
                    ) : isLastStep() ? (
                      "Complete Setup"
                    ) : (
                      "Next"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
