import Listing from "../models/Listing.js";

export const createListing = async (req, res) => {
  try {
    const listing = new Listing(req.body);
    const saved = await listing.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getListings = async (req, res) => {
  try {
    const filters = {};
    if (req.query.user_id) filters.user_id = req.query.user_id;
    if (req.query.status) filters.status = req.query.status;
    const listings = await Listing.find(filters);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
