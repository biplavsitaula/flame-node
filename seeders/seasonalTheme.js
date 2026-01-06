import mongoose from "mongoose";
import dotenv from "dotenv";
import SeasonalTheme from "../models/seasonalTheme.model.js";
import connectDB from "../config/db.js";


dotenv.config();


const themeConfigs = [
 {
   keyname: "default",
   title: "Premium Collection",
   subtitle: "Seasonal spotlight",
   description: "Discover our curated selection of premium spirits and beverages. Quality guaranteed, delivered to your door.",
   tags: ["⭐ Premium quality", "🚚 Fast delivery", "🎯 Best selection"],
   ctaText: "Explore collection",
   category: "All",
   colors: {
     primary: "from-flame-orange/30 to-flame-red/20",
     secondary: "from-flame-orange/30 to-flame-red/20",
     accent: "border-flame-orange/30",
   },
   gradient: "bg-[radial-gradient(circle_at_15%_30%,rgba(255,80,80,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,200,120,0.25),transparent_40%)]",
   emoji: "🔥",
   isActive: true,
 },
 {
   keyname: "christmas",
   title: "Crimson Christmas",
   subtitle: "Seasonal spotlight",
   description: "Santa-approved hampers, mulled wine kits, sparkling sets. Red-and-gold theme, limited-time artful packaging.",
   tags: ["🎅 Santa drops", "🎁 Gifting ready", "🕯️ Warm spices"],
   ctaText: "Explore festive picks",
   category: "Wine",
   colors: {
     primary: "from-red-500/30 to-red-600/20",
     secondary: "from-red-400/30 to-orange-400/20",
     accent: "border-red-500/30",
   },
   gradient: "bg-[radial-gradient(circle_at_15%_30%,rgba(220,38,38,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(234,88,12,0.25),transparent_40%)]",
   emoji: "🎄",
   isActive: true,
 },
 {
   keyname: "thanksgiving",
   title: "Harvest Thanksgiving",
   subtitle: "Seasonal spotlight",
   description: "Warm autumn flavors, spiced ciders, and premium selections perfect for your Thanksgiving feast. Rich amber and gold theme.",
   tags: ["🍂 Autumn harvest", "🦃 Feast ready", "🍷 Premium selection"],
   ctaText: "Shop Thanksgiving",
   category: "Wine",
   colors: {
     primary: "from-amber-500/30 to-orange-500/20",
     secondary: "from-yellow-400/30 to-amber-400/20",
     accent: "border-amber-500/30",
   },
   gradient: "bg-[radial-gradient(circle_at_15%_30%,rgba(217,119,6,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(234,179,8,0.25),transparent_40%)]",
   emoji: "🦃",
   isActive: true,
 },
 {
   keyname: "newyear",
   title: "New Year Celebration",
   subtitle: "Seasonal spotlight",
   description: "Ring in the new year with premium champagne, sparkling wines, and celebration sets. Elegant gold and silver theme.",
   tags: ["🥂 Champagne collection", "✨ Sparkling sets", "🎊 Party ready"],
   ctaText: "Celebrate New Year",
   category: "Wine",
   colors: {
     primary: "from-yellow-400/30 to-amber-400/20",
     secondary: "from-gold-400/30 to-yellow-400/20",
     accent: "border-yellow-500/30",
   },
   gradient: "bg-[radial-gradient(circle_at_15%_30%,rgba(234,179,8,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(251,191,36,0.25),transparent_40%)]",
   emoji: "🎉",
   isActive: true,
 },
 {
   keyname: "dashain",
   title: "Dashain Dhamaka",
   subtitle: "Seasonal spotlight",
   description: "Celebrate Nepal's biggest festival with premium spirits. Special festive packaging and exclusive Dashain collections.",
   tags: ["🪷 Festive vibes", "🎋 Traditional picks", "🎊 Celebration ready"],
   ctaText: "Shop Dashain specials",
   category: "All",
   colors: {
     primary: "from-red-600/30 to-orange-500/20",
     secondary: "from-red-500/30 to-yellow-400/20",
     accent: "border-red-600/30",
   },
   gradient: "bg-[radial-gradient(circle_at_15%_30%,rgba(220,38,38,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(249,115,22,0.25),transparent_40%)]",
   emoji: "🎉",
   isActive: true,
 },
 {
   keyname: "tihar",
   title: "Tihar Lights",
   subtitle: "Seasonal spotlight",
   description: "Light up your Tihar celebrations with our special collection. Perfect for gifting and festive gatherings.",
   tags: ["🪔 Diya collection", "✨ Light up", "🎁 Gift ready"],
   ctaText: "Explore Tihar picks",
   category: "All",
   colors: {
     primary: "from-amber-400/30 to-orange-400/20",
     secondary: "from-yellow-300/30 to-amber-300/20",
     accent: "border-amber-400/30",
   },
   gradient: "bg-[radial-gradient(circle_at_15%_30%,rgba(251,191,36,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(249,115,22,0.25),transparent_40%)]",
   emoji: "🪔",
   isActive: true,
 },
 {
   keyname: "holi",
   title: "Holi Colors",
   subtitle: "Seasonal spotlight",
   description: "Add colors to your Holi celebration with our vibrant collection. Perfect for parties and colorful gatherings.",
   tags: ["🌈 Colorful picks", "🎨 Party ready", "💜 Vibrant collection"],
   ctaText: "Shop Holi collection",
   category: "All",
   colors: {
     primary: "from-purple-500/30 to-pink-500/20",
     secondary: "from-blue-400/30 to-purple-400/20",
     accent: "border-purple-500/30",
   },
   gradient: "bg-[radial-gradient(circle_at_15%_30%,rgba(168,85,247,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.25),transparent_40%)]",
   emoji: "🌈",
   isActive: true,
 },
];


const seedSeasonalThemes = async () => {
 try {
   await connectDB();
   console.log("🌱 Seeding seasonal themes...");


   // Clear existing seasonal themes
   await SeasonalTheme.deleteMany({});
   console.log("🗑️  Cleared existing seasonal themes");


   // Insert all themes
   const themes = await SeasonalTheme.insertMany(themeConfigs);
   console.log(`✅ ${themes.length} seasonal themes seeded successfully!`);
  
   themes.forEach((theme) => {
     console.log(`   ${theme.emoji} ${theme.keyname}: ${theme.title}`);
   });


   mongoose.connection.close();
   console.log("🔌 Database connection closed");
 } catch (error) {
   console.error("❌ Error seeding seasonal themes:", error);
   process.exit(1);
 }
};


seedSeasonalThemes();





