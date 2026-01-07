import mongoose from "mongoose";


const SeasonalThemeSchema = new mongoose.Schema(
 {
   keyname: {
     type: String,
     required: true,
     unique: true,
     trim: true,
     lowercase: true,
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
       default: "",
     },
     secondary: {
       type: String,
       required: true,
       default: "",
     },
     accent: {
       type: String,
       required: true,
       default: "",
     },
   },
   gradient: {
     type: String,
     default: "",
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





