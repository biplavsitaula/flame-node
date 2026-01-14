import {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
} from "../services/offer.service.js";

/**
 * GET /offers
 * Fetch all offers
 */
export const fetchAllOffers = async (req, res) => {
  try {
    const offers = await getAllOffers(req.query);
    res.status(200).json({
      success: true,
      message: "Offers fetched successfully",
      data: offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching offers",
    });
  }
};

/**
 * GET /offers/:id
 * Fetch offer by ID
 */
export const fetchOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await getOfferById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer fetched successfully",
      data: offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching offer",
    });
  }
};

/**
 * POST /offers
 * Create a new offer
 */
export const createNewOffer = async (req, res) => {
  try {
    const offer = await createOffer(req.body);
    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error creating offer",
    });
  }
};

/**
 * PUT /offers/:id
 * Update an offer
 */
export const updateExistingOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await updateOffer(id, req.body);

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error updating offer",
    });
  }
};

/**
 * DELETE /offers/:id
 * Delete an offer
 */
export const deleteOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteOffer(id);
    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Offer not found",
    });
  }
};

/**
 * PATCH /offers/:id/toggle
 * Toggle offer active status
 */
export const toggleOfferActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await toggleOfferStatus(id);
    res.status(200).json({
      success: true,
      message: `Offer ${offer.isActive ? "activated" : "deactivated"} successfully`,
      data: offer,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || "Offer not found",
    });
  }
};



