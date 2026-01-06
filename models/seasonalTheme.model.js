import mongoose from "mongoose";


const SeasonalThemeSchema = new mongoose.Schema(
 {
   keyname: {
     type: String,
     required: true,
     unique: true,
     enum: ["default", "christmas", "thanksgiving", "newyear", "dashain", "tihar", "holi"],
     index: true,
   },
   title: {
     type: String,
     required: true,
     trim: true,
   },
   subtitle: {
     type: String,
     default: "Seasonal spotlight",
     trim: true,
   },
   description: {
     type: String,
     required: true,
     trim: true,
   },
   tags: {
     type: [String],
     default: [],
   },
   ctaText: {
     type: String,
     required: true,
     trim: true,
   },
   category: {
     type: String,
     default: "All",
     trim: true,
   },
   colors: {
     primary: {
       type: String,
       required: true,
     },
     secondary: {
       type: String,
       required: true,
     },
     accent: {
       type: String,
       required: true,
     },
   },
   gradient: {
     type: String,
     required: true,
   },
   emoji: {
     type: String,
     default: "",
   },
   isActive: {
     type: Boolean,
     default: true,
   },
 },
 {
   timestamps: true,
 }
);


export default mongoose.model("SeasonalTheme", SeasonalThemeSchema);





