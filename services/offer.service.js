import Offer from "../models/offer.model.js";

/**
 * Get all offers
 */
export const getAllOffers = async (query = {}) => {
  const {
    isActive,
    sortBy = "order",
    sortOrder = "asc",
  } = query;

  const filter = {};

  // Active filter
  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  // Sort
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const offers = await Offer.find(filter)
    .sort(sortOptions)
    .lean();

  return offers;
};

/**
 * Get offer by ID
 */
export const getOfferById = async (id) => {
  return await Offer.findById(id).lean();
};

/**
 * Create a new offer
 */
export const createOffer = async (offerData) => {
  // If order is not provided, set it to the highest order + 1
  if (offerData.order === undefined) {
    const maxOrderOffer = await Offer.findOne().sort({ order: -1 }).lean();
    offerData.order = maxOrderOffer ? maxOrderOffer.order + 1 : 0;
  }

  const offer = new Offer(offerData);
  return await offer.save();
};

/**
 * Update an offer
 */
export const updateOffer = async (id, updateData) => {
  const offer = await Offer.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).lean();

  if (!offer) {
    throw new Error("Offer not found");
  }

  return offer;
};

/**
 * Delete an offer
 */
export const deleteOffer = async (id) => {
  const offer = await Offer.findByIdAndDelete(id);
  if (!offer) {
    throw new Error("Offer not found");
  }
  return { message: "Offer deleted successfully" };
};

/**
 * Toggle offer active status
 */
export const toggleOfferStatus = async (id) => {
  const offer = await Offer.findById(id);
  if (!offer) {
    throw new Error("Offer not found");
  }

  offer.isActive = !offer.isActive;
  await offer.save();

  return offer.toJSON();
};



