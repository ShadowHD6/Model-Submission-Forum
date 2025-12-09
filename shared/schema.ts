import { z } from "zod";

export const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
export type SizeOption = typeof sizeOptions[number];

export const maleMorphologies = ["Slim", "Fit", "Athletic", "Muscular", "Broad", "Triangle", "Rectangle"] as const;
export const femaleMorphologies = ["Slim", "Fit", "Pear", "Hourglass", "Rectangle", "Inverted Triangle", "Curvy"] as const;

export type MaleMorphology = typeof maleMorphologies[number];
export type FemaleMorphology = typeof femaleMorphologies[number];

export const maleClothingItems = ["T-Shirt", "Hoodie", "Oversized Hoodie", "Jacket", "Sleeveless Jacket", "Pants", "Jeans"] as const;
export const femaleClothingItems = [...maleClothingItems, "Skirt"] as const;

export type MaleClothingItem = typeof maleClothingItems[number];
export type FemaleClothingItem = typeof femaleClothingItems[number];

export interface ClothingSize {
  item: string;
  realSize: SizeOption;
  comfortSize: SizeOption;
}

export const modelSubmissionSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone number is required"),
  address: z.string().min(5, "Physical address is required"),
  
  height: z.number().min(100, "Height must be at least 100 cm").max(250, "Height must be less than 250 cm"),
  chest: z.number().min(50, "Chest must be at least 50 cm").max(200, "Chest must be less than 200 cm"),
  waist: z.number().min(40, "Waist must be at least 40 cm").max(200, "Waist must be less than 200 cm"),
  hips: z.number().min(50, "Hips must be at least 50 cm").max(200, "Hips must be less than 200 cm"),
  shoulders: z.number().min(30, "Shoulders must be at least 30 cm").max(100, "Shoulders must be less than 100 cm"),
  inseam: z.number().min(50, "Inseam must be at least 50 cm").max(120, "Inseam must be less than 120 cm"),
  sleeveLength: z.number().min(40, "Sleeve length must be at least 40 cm").max(100, "Sleeve length must be less than 100 cm"),
  neckCircumference: z.number().min(25, "Neck circumference must be at least 25 cm").max(60, "Neck circumference must be less than 60 cm"),
  
  gender: z.enum(["male", "female"]),
  morphology: z.string().min(1, "Please select a body morphology"),
  
  clothingSizes: z.array(z.object({
    item: z.string(),
    realSize: z.enum(sizeOptions),
    comfortSize: z.enum(sizeOptions),
  })),
  
  notes: z.string().optional(),
});

export type ModelSubmission = z.infer<typeof modelSubmissionSchema>;

export interface ModelSubmissionWithImage extends ModelSubmission {
  imageBase64?: string;
  imageName?: string;
}
