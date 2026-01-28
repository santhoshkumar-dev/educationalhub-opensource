// // @ts-nocheck
// "use client";

// import { AnimatePresence, motion } from "framer-motion";
// import { Dispatch, SetStateAction, useState, useEffect } from "react";
// import { useRouter } from "@bprogress/next/app";
// import { useUser } from "@clerk/nextjs";
// import {
//   Button,
//   Chip,
//   Card,
//   CardBody,
//   Spinner,
//   Select,
//   SelectItem,
// } from "@heroui/react";
// import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

// interface OnBoardingModelProps {
//   isOpen: boolean;
//   setIsOpen: Dispatch<SetStateAction<boolean>>;
// }

// interface Category {
//   _id: string;
//   title: string;
//   description: string;
//   img: string;
//   slug: string;
// }

// interface Interest {
//   categoryId: string;
//   categoryName: string;
// }

// export const OnBoardingModelEnhanced: React.FC<OnBoardingModelProps> = ({
//   isOpen,
//   setIsOpen,
// }) => {
//   const router = useRouter();
//   const { user } = useUser();

//   const [step, setStep] = useState(1);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
//   const [skillLevel, setSkillLevel] = useState<string>("all");
//   const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

//   // Fetch categories when component mounts and step is 2
//   useEffect(() => {
//     if (step === 2 && categories.length === 0) {
//       fetchCategories();
//     }
//   }, [step]);

//   const fetchCategories = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("/api/category?limit=100");
//       const data = await response.json();
//       setCategories(data.data || []);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCategoryToggle = (category: Category) => {
//     const isSelected = selectedInterests.some(
//       (interest) => interest.categoryId === category._id,
//     );

//     if (isSelected) {
//       setSelectedInterests(
//         selectedInterests.filter(
//           (interest) => interest.categoryId !== category._id,
//         ),
//       );
//     } else {
//       if (selectedInterests.length < 5) {
//         setSelectedInterests([
//           ...selectedInterests,
//           { categoryId: category._id, categoryName: category.title },
//         ]);
//       }
//     }
//   };

//   const handleSavePreferences = async () => {
//     if (selectedInterests.length === 0) {
//       alert("Please select at least one interest to continue");
//       return;
//     }

//     setSaving(true);
//     try {
//       const response = await fetch("/api/user/preferences", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           interests: selectedInterests,
//           skillLevel,
//           priceRange,
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setIsOpen(false);
//         router.push("/");
//         router.refresh();
//       } else {
//         console.error("Failed to save preferences:", data.error);
//         alert("Failed to save preferences. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error saving preferences:", error);
//       alert("An error occurred. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSkip = () => {
//     setIsOpen(false);
//     router.push("/");
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-50 grid cursor-pointer place-items-center overflow-y-scroll bg-slate-900/20 p-8 backdrop-blur"
//           onClick={() => {}}
//         >
//           <motion.div
//             initial={{ scale: 0, rotate: "12.5deg" }}
//             animate={{ scale: 1, rotate: "0deg" }}
//             exit={{ scale: 0, rotate: "0deg" }}
//             onClick={(e) => e.stopPropagation()}
//             className="relative w-full max-w-4xl cursor-default overflow-hidden rounded-lg bg-[#191919] p-8 text-white shadow-xl"
//           >
//             <div className="relative z-10">
//               {/* Progress Indicator */}
//               <div className="mb-6 flex items-center justify-center">
//                 <div className="flex items-center gap-2">
//                   <div
//                     className={`h-3 w-3 rounded-full ${
//                       step >= 1 ? "bg-blue-500" : "bg-gray-600"
//                     }`}
//                   />
//                   <div className="h-0.5 w-12 bg-gray-600">
//                     <div
//                       className={`h-full bg-blue-500 transition-all ${
//                         step >= 2 ? "w-full" : "w-0"
//                       }`}
//                     />
//                   </div>
//                   <div
//                     className={`h-3 w-3 rounded-full ${
//                       step >= 2 ? "bg-blue-500" : "bg-gray-600"
//                     }`}
//                   />
//                   <div className="h-0.5 w-12 bg-gray-600">
//                     <div
//                       className={`h-full bg-blue-500 transition-all ${
//                         step >= 3 ? "w-full" : "w-0"
//                       }`}
//                     />
//                   </div>
//                   <div
//                     className={`h-3 w-3 rounded-full ${
//                       step >= 3 ? "bg-blue-500" : "bg-gray-600"
//                     }`}
//                   />
//                 </div>
//               </div>

//               {/* Step 1: Welcome */}
//               {step === 1 && (
//                 <motion.div
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                 >
//                   <div className="mb-4 flex justify-center">
//                     <Sparkles className="h-12 w-12 text-blue-500" />
//                   </div>
//                   <h3 className="mb-4 border-b border-gray-700 pb-4 text-center font-Monument text-4xl">
//                     Welcome!
//                   </h3>

//                   <p className="my-6 leading-relaxed text-gray-300">
//                     We're delighted to have you here! Remember, every great
//                     journey begins with a single step, and you've already taken
//                     that first one. Whatever you choose to do, give it your all.
//                     Life is full of opportunities, and each moment is a chance
//                     to learn, grow, and make an impact. Stay curious, keep
//                     pushing forward, and believe in your ability to create
//                     something extraordinary. The path ahead is yours to
//                     shape—let's make it a remarkable one!
//                     <br />
//                     <br />
//                     <span className="font-bold italic text-blue-500">
//                       - Santhosh Kumar
//                     </span>
//                   </p>

//                   <div className="mt-8 flex gap-3">
//                     <Button
//                       onClick={() => setStep(2)}
//                       className="flex-1 bg-blue-500 py-6 font-semibold text-white transition-colors hover:bg-blue-600"
//                       endContent={<ArrowRight className="h-4 w-4" />}
//                     >
//                       Get Started
//                     </Button>
//                     <Button
//                       onClick={handleSkip}
//                       variant="bordered"
//                       className="border-gray-600 py-6 font-semibold text-gray-300 transition-colors hover:bg-gray-800"
//                     >
//                       Skip
//                     </Button>
//                   </div>
//                 </motion.div>
//               )}

//               {/* Step 2: Interest Selection */}
//               {step === 2 && (
//                 <motion.div
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                 >
//                   <h3 className="mb-2 border-b border-gray-700 pb-4 font-Monument text-3xl">
//                     What are you interested in?
//                   </h3>
//                   <p className="mb-6 text-gray-400">
//                     Select up to 5 topics you'd like to learn about. We'll use
//                     this to recommend courses just for you.
//                   </p>

//                   {loading ? (
//                     <div className="flex items-center justify-center py-12">
//                       <Spinner size="lg" color="primary" />
//                     </div>
//                   ) : (
//                     <>
//                       <div className="mb-6 grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto pr-2 md:grid-cols-3">
//                         {categories.map((category) => {
//                           const isSelected = selectedInterests.some(
//                             (interest) => interest.categoryId === category._id,
//                           );
//                           return (
//                             <Card
//                               key={category._id}
//                               isPressable
//                               onPress={() => handleCategoryToggle(category)}
//                               className={`relative cursor-pointer transition-all ${
//                                 isSelected
//                                   ? "border-2 border-blue-500 bg-blue-500/20"
//                                   : "border-2 border-transparent bg-gray-800 hover:border-gray-600"
//                               }`}
//                             >
//                               <CardBody className="p-4">
//                                 {isSelected && (
//                                   <div className="absolute right-2 top-2">
//                                     <CheckCircle2 className="h-5 w-5 text-blue-500" />
//                                   </div>
//                                 )}
//                                 <img
//                                   src={category.img}
//                                   alt={category.title}
//                                   className="mb-2 h-24 w-full rounded-md object-cover"
//                                 />
//                                 <h4 className="text-sm font-semibold text-white">
//                                   {category.title}
//                                 </h4>
//                               </CardBody>
//                             </Card>
//                           );
//                         })}
//                       </div>

//                       <div className="mb-4">
//                         <p className="text-sm text-gray-400">
//                           Selected: {selectedInterests.length}/5
//                         </p>
//                         <div className="mt-2 flex flex-wrap gap-2">
//                           {selectedInterests.map((interest) => (
//                             <Chip
//                               key={interest.categoryId}
//                               onClose={() => {
//                                 setSelectedInterests(
//                                   selectedInterests.filter(
//                                     (i) => i.categoryId !== interest.categoryId,
//                                   ),
//                                 );
//                               }}
//                               variant="flat"
//                               color="primary"
//                             >
//                               {interest.categoryName}
//                             </Chip>
//                           ))}
//                         </div>
//                       </div>

//                       <div className="flex gap-3">
//                         <Button
//                           onClick={() => setStep(1)}
//                           variant="bordered"
//                           className="border-gray-600 py-6 font-semibold text-gray-300"
//                           startContent={<ArrowLeft className="h-4 w-4" />}
//                         >
//                           Back
//                         </Button>
//                         <Button
//                           onClick={() => setStep(3)}
//                           isDisabled={selectedInterests.length === 0}
//                           className="flex-1 bg-blue-500 py-6 font-semibold text-white hover:bg-blue-600"
//                           endContent={<ArrowRight className="h-4 w-4" />}
//                         >
//                           Continue
//                         </Button>
//                       </div>
//                     </>
//                   )}
//                 </motion.div>
//               )}

//               {/* Step 3: Additional Preferences */}
//               {step === 3 && (
//                 <motion.div
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                 >
//                   <h3 className="mb-2 border-b border-gray-700 pb-4 font-Monument text-3xl">
//                     Tell us more about you
//                   </h3>
//                   <p className="mb-6 text-gray-400">
//                     Help us fine-tune your recommendations (optional)
//                   </p>

//                   <div className="mb-8 space-y-6">
//                     {/* Skill Level */}
//                     <div>
//                       <label className="mb-2 block text-sm font-medium text-gray-300">
//                         What's your skill level?
//                       </label>
//                       <Select
//                         placeholder="Select your skill level"
//                         selectedKeys={[skillLevel]}
//                         onChange={(e) => setSkillLevel(e.target.value)}
//                         classNames={{
//                           trigger: "bg-gray-800 border-gray-700",
//                           value: "text-white",
//                         }}
//                       >
//                         <SelectItem key="all" value="all">
//                           All Levels
//                         </SelectItem>
//                         <SelectItem key="beginner" value="beginner">
//                           Beginner
//                         </SelectItem>
//                         <SelectItem key="intermediate" value="intermediate">
//                           Intermediate
//                         </SelectItem>
//                         <SelectItem key="advanced" value="advanced">
//                           Advanced
//                         </SelectItem>
//                       </Select>
//                     </div>

//                     {/* Price Range */}
//                     <div>
//                       <label className="mb-2 block text-sm font-medium text-gray-300">
//                         Preferred price range
//                       </label>
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <label className="mb-1 block text-xs text-gray-400">
//                             Min Price
//                           </label>
//                           <input
//                             type="number"
//                             min="0"
//                             value={priceRange.min}
//                             onChange={(e) =>
//                               setPriceRange({
//                                 ...priceRange,
//                                 min: parseInt(e.target.value) || 0,
//                               })
//                             }
//                             className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
//                           />
//                         </div>
//                         <div>
//                           <label className="mb-1 block text-xs text-gray-400">
//                             Max Price
//                           </label>
//                           <input
//                             type="number"
//                             min="0"
//                             value={priceRange.max}
//                             onChange={(e) =>
//                               setPriceRange({
//                                 ...priceRange,
//                                 max: parseInt(e.target.value) || 10000,
//                               })
//                             }
//                             className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Selected Interests Summary */}
//                     <div className="rounded-lg bg-gray-800 p-4">
//                       <p className="mb-2 text-sm font-medium text-gray-300">
//                         Your selected interests:
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {selectedInterests.map((interest) => (
//                           <Chip
//                             key={interest.categoryId}
//                             variant="flat"
//                             color="primary"
//                           >
//                             {interest.categoryName}
//                           </Chip>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-3">
//                     <Button
//                       onClick={() => setStep(2)}
//                       variant="bordered"
//                       className="border-gray-600 py-6 font-semibold text-gray-300"
//                       startContent={<ArrowLeft className="h-4 w-4" />}
//                       isDisabled={saving}
//                     >
//                       Back
//                     </Button>
//                     <Button
//                       onClick={handleSavePreferences}
//                       className="flex-1 bg-blue-500 py-6 font-semibold text-white hover:bg-blue-600"
//                       isLoading={saving}
//                       endContent={
//                         !saving && <CheckCircle2 className="h-4 w-4" />
//                       }
//                     >
//                       {saving ? "Saving..." : "Complete Setup"}
//                     </Button>
//                   </div>
//                 </motion.div>
//               )}
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };
