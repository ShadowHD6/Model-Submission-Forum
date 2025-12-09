import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  modelSubmissionSchema, 
  type ModelSubmission, 
  sizeOptions, 
  maleMorphologies, 
  femaleMorphologies,
  maleClothingItems,
  femaleClothingItems,
  type ClothingSize
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, User, Ruler, Users, Shirt, FileText, Send, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoUrl from "@assets/logo THEOS.svg";

export default function ModelSubmission() {
  const { toast } = useToast();
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [selectedMorphology, setSelectedMorphology] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [clothingSizes, setClothingSizes] = useState<ClothingSize[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ModelSubmission>({
    resolver: zodResolver(modelSubmissionSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      height: undefined,
      chest: undefined,
      waist: undefined,
      hips: undefined,
      shoulders: undefined,
      inseam: undefined,
      sleeveLength: undefined,
      neckCircumference: undefined,
      gender: undefined,
      morphology: "",
      clothingSizes: [],
      notes: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ModelSubmission) => {
      const res = await apiRequest("POST", "/api/submit", {
        ...data,
        imageBase64,
        imageName,
      });

      const json = (await res.json()) as { success: boolean; pdfBase64: string; whatsappLink: string };
      return json;
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Your model submission has been processed! The PDF will download and WhatsApp will open.",
      });
      
      // Download PDF
      if (response.pdfBase64) {
        const link = document.createElement("a");
        link.href = response.pdfBase64;
        link.download = `model-submission-${form.getValues("fullName").replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Open WhatsApp
      if (response.whatsappLink) {
        window.open(response.whatsappLink, "_blank");
      }
      
      form.reset();
      setGender(null);
      setSelectedMorphology("");
      setImagePreview(null);
      setImageBase64("");
      setImageName("");
      setClothingSizes([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit the form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenderChange = (newGender: "male" | "female") => {
    setGender(newGender);
    setSelectedMorphology("");
    form.setValue("gender", newGender);
    form.setValue("morphology", "");
    
    const items = newGender === "male" ? maleClothingItems : femaleClothingItems;
    const defaultSizes: ClothingSize[] = items.map(item => ({
      item,
      realSize: "M",
      comfortSize: "M",
    }));
    setClothingSizes(defaultSizes);
    form.setValue("clothingSizes", defaultSizes);
  };

  const handleMorphologySelect = (morphology: string) => {
    setSelectedMorphology(morphology);
    form.setValue("morphology", morphology);
  };

  const updateClothingSize = (index: number, field: "realSize" | "comfortSize", value: string) => {
    const updated = [...clothingSizes];
    updated[index] = { ...updated[index], [field]: value };
    setClothingSizes(updated);
    form.setValue("clothingSizes", updated);
  };

  const onSubmit = (data: ModelSubmission) => {
    if (!imageBase64) {
      toast({
        title: "Image Required",
        description: "Please upload a picture of yourself.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(data);
  };

  const morphologies = gender === "male" ? maleMorphologies : femaleMorphologies;
  const clothingItems = gender === "male" ? maleClothingItems : femaleClothingItems;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Fixed Header */}
      <header style={{ paddingTop: 'env(safe-area-inset-top)' }} className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#1A1A1A]">
        <div className="flex flex-col items-center py-3 sm:py-4">
          <div className="flex items-center justify-center w-[120px] sm:w-[150px]">
            <img src={logoUrl} style={{ width: '100%', height: 'auto' }} alt="Theos logo" />
          </div>
          <span className="text-[#C0C0C0] text-sm mt-1 tracking-wider">Model Submission Forum</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-28 pb-24 sm:pb-40 px-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[650px] mx-auto space-y-8">
          
          {/* Section 1: Personal Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[#C0C0C0]" />
              <h2 className="text-[#C0C0C0] text-lg font-medium tracking-wide">Personal Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-[#C0C0C0] text-sm mb-2 block">Full Name</Label>
                <Input
                  id="fullName"
                  data-testid="input-fullname"
                  placeholder="Enter your full name"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("fullName")}
                />
                {form.formState.errors.fullName && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-[#C0C0C0] text-sm mb-2 block">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  placeholder="your@email.com"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-[#C0C0C0] text-sm mb-2 block">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  data-testid="input-phone"
                  placeholder="+1 234 567 890"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="text-[#C0C0C0] text-sm mb-2 block">Physical Address</Label>
                <Textarea
                  id="address"
                  data-testid="input-address"
                  placeholder="Enter your full address"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0] min-h-[80px]"
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div>
                <Label className="text-[#C0C0C0] text-sm mb-2 block">Upload a Picture</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2A2A2A] rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-[#C0C0C0]/50"
                  data-testid="input-image-upload"
                >
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                      <span className="text-[#C0C0C0] text-sm">{imageName}</span>
                      <span className="text-[#606060] text-xs">Click to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-[#606060]" />
                      <span className="text-[#606060] text-sm">Click to upload your picture</span>
                      <span className="text-[#404040] text-xs">JPG, PNG up to 10MB</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Body Measurements */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Ruler className="w-5 h-5 text-[#C0C0C0]" />
              <h2 className="text-[#C0C0C0] text-lg font-medium tracking-wide">Body Measurements (cm)</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height" className="text-[#C0C0C0] text-sm mb-2 block">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  data-testid="input-height"
                  placeholder="175"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("height", { valueAsNumber: true })}
                />
                {form.formState.errors.height && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.height.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="chest" className="text-[#C0C0C0] text-sm mb-2 block">Chest/Bust (cm)</Label>
                <Input
                  id="chest"
                  type="number"
                  data-testid="input-chest"
                  placeholder="95"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("chest", { valueAsNumber: true })}
                />
                {form.formState.errors.chest && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.chest.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="waist" className="text-[#C0C0C0] text-sm mb-2 block">Waist (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  data-testid="input-waist"
                  placeholder="80"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("waist", { valueAsNumber: true })}
                />
                {form.formState.errors.waist && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.waist.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="hips" className="text-[#C0C0C0] text-sm mb-2 block">Hips (cm)</Label>
                <Input
                  id="hips"
                  type="number"
                  data-testid="input-hips"
                  placeholder="95"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("hips", { valueAsNumber: true })}
                />
                {form.formState.errors.hips && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.hips.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="shoulders" className="text-[#C0C0C0] text-sm mb-2 block">Shoulders (cm)</Label>
                <Input
                  id="shoulders"
                  type="number"
                  data-testid="input-shoulders"
                  placeholder="45"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("shoulders", { valueAsNumber: true })}
                />
                {form.formState.errors.shoulders && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.shoulders.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="inseam" className="text-[#C0C0C0] text-sm mb-2 block">Inseam (cm)</Label>
                <Input
                  id="inseam"
                  type="number"
                  data-testid="input-inseam"
                  placeholder="80"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("inseam", { valueAsNumber: true })}
                />
                {form.formState.errors.inseam && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.inseam.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sleeveLength" className="text-[#C0C0C0] text-sm mb-2 block">Sleeve Length (cm)</Label>
                <Input
                  id="sleeveLength"
                  type="number"
                  data-testid="input-sleeve"
                  placeholder="65"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("sleeveLength", { valueAsNumber: true })}
                />
                {form.formState.errors.sleeveLength && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.sleeveLength.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="neckCircumference" className="text-[#C0C0C0] text-sm mb-2 block">Neck Circumference (cm)</Label>
                <Input
                  id="neckCircumference"
                  type="number"
                  data-testid="input-neck"
                  placeholder="38"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0]"
                  {...form.register("neckCircumference", { valueAsNumber: true })}
                />
                {form.formState.errors.neckCircumference && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.neckCircumference.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Gender Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-[#C0C0C0]" />
              <h2 className="text-[#C0C0C0] text-lg font-medium tracking-wide">Gender Selection</h2>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                data-testid="button-gender-male"
                onClick={() => handleGenderChange("male")}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
                  gender === "male"
                    ? "bg-[#C0C0C0] text-[#0A0A0A]"
                    : "bg-[#1A1A1A] text-[#C0C0C0] border border-[#2A2A2A] hover:border-[#C0C0C0]/50"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                data-testid="button-gender-female"
                onClick={() => handleGenderChange("female")}
                className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
                  gender === "female"
                    ? "bg-[#C0C0C0] text-[#0A0A0A]"
                    : "bg-[#1A1A1A] text-[#C0C0C0] border border-[#2A2A2A] hover:border-[#C0C0C0]/50"
                }`}
              >
                Female
              </button>
            </div>
            {form.formState.errors.gender && (
              <p className="text-red-400 text-xs">{form.formState.errors.gender.message}</p>
            )}
          </section>

          {/* Section 4: Body Morphology */}
          {gender && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[#C0C0C0]" />
                <h2 className="text-[#C0C0C0] text-lg font-medium tracking-wide">Body Morphology</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {morphologies.map((morph) => (
                  <button
                    key={morph}
                    type="button"
                    data-testid={`button-morphology-${morph.toLowerCase().replace(' ', '-')}`}
                    onClick={() => handleMorphologySelect(morph)}
                    className={`py-4 px-4 rounded-lg text-sm font-medium transition-all ${
                      selectedMorphology === morph
                        ? "bg-[#1A1A1A] border-2 border-[#C0C0C0] text-[#C0C0C0]"
                        : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#808080] hover:border-[#C0C0C0]/50 hover:text-[#C0C0C0]"
                    }`}
                  >
                    {morph}
                  </button>
                ))}
              </div>
              {form.formState.errors.morphology && (
                <p className="text-red-400 text-xs">{form.formState.errors.morphology.message}</p>
              )}
            </section>
          )}

          {/* Section 5: Clothing Sizes */}
          {gender && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Shirt className="w-5 h-5 text-[#C0C0C0]" />
                <h2 className="text-[#C0C0C0] text-lg font-medium tracking-wide">Clothing Sizes</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm text-[#808080] pb-2 border-b border-[#2A2A2A]">
                  <span>Item</span>
                  <span className="text-center">Real Size</span>
                  <span className="text-center">Comfort Size</span>
                </div>
                
                {clothingItems.map((item, index) => (
                  <div key={item} className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-[#C0C0C0] text-sm">{item}</span>
                    <Select
                      value={clothingSizes[index]?.realSize || "M"}
                      onValueChange={(value) => updateClothingSize(index, "realSize", value)}
                    >
                      <SelectTrigger 
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] rounded-lg"
                        data-testid={`select-real-${item.toLowerCase().replace(' ', '-')}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                        {sizeOptions.map((size) => (
                          <SelectItem key={size} value={size} className="text-[#C0C0C0]">
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={clothingSizes[index]?.comfortSize || "M"}
                      onValueChange={(value) => updateClothingSize(index, "comfortSize", value)}
                    >
                      <SelectTrigger 
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] rounded-lg"
                        data-testid={`select-comfort-${item.toLowerCase().replace(' ', '-')}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                        {sizeOptions.map((size) => (
                          <SelectItem key={size} value={size} className="text-[#C0C0C0]">
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 6: Notes */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-[#C0C0C0]" />
              <h2 className="text-[#C0C0C0] text-lg font-medium tracking-wide">Additional Notes</h2>
            </div>
            
            <Textarea
              data-testid="input-notes"
              placeholder="Write anything you want to add..."
              className="bg-[#1A1A1A] border-[#2A2A2A] text-[#C0C0C0] placeholder:text-[#606060] rounded-lg focus:border-[#C0C0C0] focus:ring-[#C0C0C0] min-h-[120px]"
              {...form.register("notes")}
            />
          </section>

          {/* Section 7: Submit Button */}
          <section className="flex justify-center pt-4">
            <Button
              type="submit"
              data-testid="button-submit"
              disabled={submitMutation.isPending}
              className="w-full sm:max-w-[200px] bg-[#1A1A1A] text-[#C0C0C0] border border-[#2A2A2A] hover:bg-[#252525] hover:border-[#C0C0C0]/50 rounded-lg py-3 sm:py-4 text-sm sm:text-base font-medium transition-all shadow-lg"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </section>
        </form>
      </main>

      {/* Fixed Footer */}
      <footer style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} className="sm:fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-t border-[#1A1A1A]">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-3 sm:py-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-[90px] sm:w-[100px]">
              <img src={logoUrl} style={{ width: '100%', height: 'auto' }} alt="Theos logo" />
            </div>
          </div>
          <a href="tel:+21652287812" className="text-[#808080] text-sm hover:text-[#C0C0C0] transition-colors">
            +216 52 287 812
          </a>
          <a href="mailto:sfarwajdi@outlook.fr" className="text-[#808080] text-sm hover:text-[#C0C0C0] transition-colors">
            sfarwajdi@outlook.fr
          </a>
          <a 
            href="https://www.instagram.com/be_theos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#808080] hover:text-[#C0C0C0] transition-colors"
            data-testid="link-instagram"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
