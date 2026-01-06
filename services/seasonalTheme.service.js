import SeasonalTheme from "../models/seasonalTheme.model.js";
import Settings from "../models/settings.model.js";


/**
* Get all seasonal themes
*/
export const getAllSeasonalThemes = async () => {
 return await SeasonalTheme.find({ isActive: true }).lean();
};


/**
* Get seasonal theme by keyname
*/
export const getSeasonalThemeByKeyname = async (keyname) => {
 return await SeasonalTheme.findOne({ keyname, isActive: true }).lean();
};


/**
* Get current seasonal theme based on user's settings
* Fetches the theme selected in settings and returns corresponding theme data
*/
export const getCurrentSeasonalTheme = async () => {
 // Get current settings to find selected theme
 const settings = await Settings.getSettings();
 const selectedTheme = settings.theme || "default";


 // Find the seasonal theme matching the selected theme
 let theme = await SeasonalTheme.findOne({
   keyname: selectedTheme,
   isActive: true
 }).lean();


 // Fallback to default if selected theme not found
 if (!theme) {
   theme = await SeasonalTheme.findOne({
     keyname: "default",
     isActive: true
   }).lean();
 }


 return {
   selectedTheme: selectedTheme,
   themeData: theme,
 };
};


/**
* Create a new seasonal theme
*/
export const createSeasonalTheme = async (themeData) => {
 const theme = new SeasonalTheme(themeData);
 return await theme.save();
};


/**
* Update a seasonal theme by keyname
*/
export const updateSeasonalTheme = async (keyname, updateData) => {
 return await SeasonalTheme.findOneAndUpdate(
   { keyname },
   updateData,
   { new: true, runValidators: true }
 ).lean();
};


/**
* Delete a seasonal theme by keyname
*/
export const deleteSeasonalTheme = async (keyname) => {
 // Don't allow deleting the default theme
 if (keyname === "default") {
   throw new Error("Cannot delete the default theme");
 }
 return await SeasonalTheme.findOneAndDelete({ keyname });
};





