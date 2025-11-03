import Listing from "../models/Listing.js";

export const createListing = async (req, res) => {
  try {
    const normalize = (body, req) => {
      const toNumber = (v) => {
        if (v === undefined || v === null || v === "") return undefined;
        const n = Number(v);
        return Number.isNaN(n) ? undefined : n;
      };

      const features = Array.isArray(body.features)
        ? body.features
        : body.features
        ? [body.features]
        : [];

      const images = Array.isArray(body.images)
        ? body.images
        : body.images
        ? [body.images]
        : [];

      return {
        user_id: body.user_id || req.user?.id,
        title: body.title,
        description: body.description || "",
        property_type: body.propertyType || body.property_type,
        listing_type: body.listingType || body.listing_type,
        price: toNumber(body.price),
        location: body.location,
        city: body.city,
        bedrooms: toNumber(body.bedrooms),
        bathrooms: toNumber(body.bathrooms),
        area: toNumber(body.area),
        parking_spaces: toNumber(body.parkingSpaces),
        year_built: toNumber(body.yearBuilt),
        features,
        images,
        contact_name: body.contactName || body.contact_name,
        contact_email: body.contactEmail || body.contact_email,
        contact_phone: body.contactPhone || body.contact_phone,
        agency_name: body.agencyName,
        license_number: body.licenseNumber,
        status: body.status,
        seller_type: body.sellerType,
        subscription_plan: body.subscriptionPlan,
        billing_cycle: body.billingCycle,
      };
    };

    const payload = normalize(req.body, req);
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    const listing = new Listing(payload);
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
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateListing = async (req, res) => {
  try {
    const normalize = (body, req) => {
      const toNumber = (v) => {
        if (v === undefined || v === null || v === "") return undefined;
        const n = Number(v);
        return Number.isNaN(n) ? undefined : n;
      };

      const features = Array.isArray(body.features)
        ? body.features
        : body.features
        ? [body.features]
        : undefined;

      const images = Array.isArray(body.images)
        ? body.images
        : body.images
        ? [body.images]
        : undefined;

      return {
        title: body.title,
        description: body.description,
        property_type: body.propertyType || body.property_type,
        listing_type: body.listingType || body.listing_type,
        price: toNumber(body.price),
        location: body.location,
        city: body.city,
        bedrooms: toNumber(body.bedrooms),
        bathrooms: toNumber(body.bathrooms),
        area: toNumber(body.area),
        parking_spaces: toNumber(body.parkingSpaces),
        year_built: toNumber(body.yearBuilt),
        features,
        images,
        contact_name: body.contactName || body.contact_name,
        contact_email: body.contactEmail || body.contact_email,
        contact_phone: body.contactPhone || body.contact_phone,
        agency_name: body.agencyName,
        license_number: body.licenseNumber,
        status: body.status,
        seller_type: body.sellerType,
        subscription_plan: body.subscriptionPlan,
        billing_cycle: body.billingCycle,
      };
    };

    const payload = normalize(req.body, req);
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    const listing = await Listing.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
