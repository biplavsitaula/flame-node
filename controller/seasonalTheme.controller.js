import {
 getAllSeasonalThemes,
 getSeasonalThemeByKeyname,
 getCurrentSeasonalTheme,
 createSeasonalTheme,
 updateSeasonalTheme,
 deleteSeasonalTheme,
} from "../services/seasonalTheme.service.js";


/**
* GET /seasonal-themes
* Fetch all seasonal themes
*/
export const fetchAllSeasonalThemes = async (req, res) => {
 try {
   const themes = await getAllSeasonalThemes();
   res.status(200).json({
     success: true,
     message: "Seasonal themes fetched successfully",
     data: themes,
   });
 } catch (error) {
   res.status(500).json({
     success: false,
     message: error.message || "Error fetching seasonal themes",
   });
 }
};


/**
 * GET /seasonal-themes/current
 * Fetch the current seasonal theme based on user's settings selection
 * Returns all theme attributes directly
 */
export const fetchCurrentSeasonalTheme = async (req, res) => {
  try {
    const theme = await getCurrentSeasonalTheme();
    
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: "No seasonal theme found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Current seasonal theme fetched successfully",
      data: theme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching current seasonal theme",
    });
  }
};


/**
* GET /seasonal-themes/:keyname
* Fetch a specific seasonal theme by keyname
*/
export const fetchSeasonalThemeByKeyname = async (req, res) => {
 try {
   const { keyname } = req.params;
   const theme = await getSeasonalThemeByKeyname(keyname);
  
   if (!theme) {
     return res.status(404).json({
       success: false,
       message: "Seasonal theme not found",
     });
   }


   res.status(200).json({
     success: true,
     message: "Seasonal theme fetched successfully",
     data: theme,
   });
 } catch (error) {
   res.status(500).json({
     success: false,
     message: error.message || "Error fetching seasonal theme",
   });
 }
};


/**
* POST /seasonal-themes
* Create a new seasonal theme
*/
export const createNewSeasonalTheme = async (req, res) => {
 try {
   const theme = await createSeasonalTheme(req.body);
   res.status(201).json({
     success: true,
     message: "Seasonal theme created successfully",
     data: theme,
   });
 } catch (error) {
   res.status(400).json({
     success: false,
     message: error.message || "Error creating seasonal theme",
   });
 }
};


/**
* PUT /seasonal-themes/:keyname
* Update a seasonal theme
*/
export const updateExistingSeasonalTheme = async (req, res) => {
 try {
   const { keyname } = req.params;
   const theme = await updateSeasonalTheme(keyname, req.body);
  
   if (!theme) {
     return res.status(404).json({
       success: false,
       message: "Seasonal theme not found",
     });
   }


   res.status(200).json({
     success: true,
     message: "Seasonal theme updated successfully",
     data: theme,
   });
 } catch (error) {
   res.status(400).json({
     success: false,
     message: error.message || "Error updating seasonal theme",
   });
 }
};


/**
* DELETE /seasonal-themes/:keyname
* Delete a seasonal theme
*/
export const deleteSeasonalThemeByKeyname = async (req, res) => {
 try {
   const { keyname } = req.params;
   await deleteSeasonalTheme(keyname);
   res.status(200).json({
     success: true,
     message: "Seasonal theme deleted successfully",
   });
 } catch (error) {
   res.status(400).json({
     success: false,
     message: error.message || "Error deleting seasonal theme",
   });
 }
};





