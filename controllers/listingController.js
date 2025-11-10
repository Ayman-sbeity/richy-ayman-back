import Listing from "../models/Listing.js";
import UserSubscription from "../models/UserSubscription.js";
import User from "../models/User.js";
import { uploadMultipleToImgBB, processImageArray } from "../utils/imgbbUpload.js";
import { sendNewPropertyNotification } from "../utils/emailService.js";

export const createListing = async (req, res) => {
  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        imageUrls = await uploadMultipleToImgBB(req.files);
      } catch (uploadErr) {
        return res.status(500).json({ 
          message: "Image upload failed", 
          error: uploadErr.message 
        });
      }
    }

    if (req.body.images) {
      try {
        const bodyImages = Array.isArray(req.body.images) 
          ? req.body.images 
          : [req.body.images];
        
        const processedBodyImages = await processImageArray(bodyImages);
        imageUrls = [...imageUrls, ...processedBodyImages];
      } catch (uploadErr) {
        return res.status(500).json({ 
          message: "Image processing failed", 
          error: uploadErr.message 
        });
      }
    }

    const userId = req.user._id || req.user.id;

    let subscription = await UserSubscription.findOne({ 
      user_id: userId,
      status: 'active',
      expirationDate: { $gt: new Date() }
    });
    
    if (!subscription) {
      const anySubscription = await UserSubscription.findOne({ user_id: userId });
      
      if (!anySubscription) {
        console.log(`Creating free subscription for user ${userId}`);
        subscription = new UserSubscription({
          user_id: userId,
          plan: 'free',
          billingCycle: 'monthly',
          status: 'active',
          price: 0,
          startDate: new Date(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        });
        await subscription.save();
      } else if (anySubscription.status !== 'active') {
        return res.status(403).json({ 
          message: `Your subscription is ${anySubscription.status}. Please activate your subscription to create listings.` 
        });
      } else if (anySubscription.expirationDate && anySubscription.expirationDate <= new Date()) {
        return res.status(403).json({ 
          message: 'Your subscription has expired. Please renew to create listings.' 
        });
      } else {
        return res.status(403).json({ 
          message: 'Active subscription required to create listings' 
        });
      }
    }
    
    const limits = {
      free: 1,
      basic: 5,
      premium: 20,
      professional: -1
    };
    
    if (limits[subscription.plan] !== -1) {
      const count = await Listing.countDocuments({ user_id: userId });
      if (count >= limits[subscription.plan]) {
        return res.status(403).json({ 
          message: `Listing limit reached for ${subscription.plan} plan` 
        });
      }
    }

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

      const images = imageUrls;

      return {
        user_id: body.user_id || userId,
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
      };
    };

    const payload = normalize(req.body, req);
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    const listing = new Listing(payload);
    const saved = await listing.save();
    
    try {
      const users = await User.find({}, 'email name');
      if (users && users.length > 0) {
        sendNewPropertyNotification(users, {
          title: saved.title,
          city: saved.city,
          property_type: saved.property_type,
          listing_type: saved.listing_type,
          price: saved.price
        }).catch(err => {
          console.error('Error sending new property notifications:', err);
        });
      }
    } catch (emailErr) {
      console.error('Error fetching users for notifications:', emailErr);
    }
    
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getListings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      priceType, 
      listing_type,
      seller_type,
      city, 
      propertyType,
      maxPrice,
      minPrice,
      bedrooms,
      bathrooms,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      features,
      user_id, 
      status
    } = req.query;

    const filters = {};
    
    if (user_id) filters.user_id = user_id;
    if (status) filters.status = status;
    
    if (listing_type) {
      filters.listing_type = { $regex: new RegExp(`^${listing_type.trim()}$`, 'i') };
    } else if (priceType) {
      filters.listing_type = priceType;
    }
    
    if (seller_type) {
      filters.seller_type = { $regex: new RegExp(`^${seller_type.trim()}$`, 'i') };
    }
    
    if (city) {
      filters.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }
    
    if (propertyType) {
      filters.property_type = { $regex: new RegExp(`^${propertyType.trim()}$`, 'i') };
    }
    
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    
    if (bedrooms) {
      filters.bedrooms = Number(bedrooms.trim());
    } else if (minBedrooms || maxBedrooms) {
      filters.bedrooms = {};
      if (minBedrooms) filters.bedrooms.$gte = Number(minBedrooms.trim());
      if (maxBedrooms) filters.bedrooms.$lte = Number(maxBedrooms.trim());
    }
    
    if (bathrooms) {
      filters.bathrooms = Number(bathrooms.trim());
    } else if (minBathrooms || maxBathrooms) {
      filters.bathrooms = {};
      if (minBathrooms) filters.bathrooms.$gte = Number(minBathrooms.trim());
      if (maxBathrooms) filters.bathrooms.$lte = Number(maxBathrooms.trim());
    }
    
    if (features) {
      const featuresArray = features.split(',').map(f => f.trim());
      filters.features = { $all: featuresArray };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const listings = await Listing.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

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
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        imageUrls = await uploadMultipleToImgBB(req.files);
      } catch (uploadErr) {
        return res.status(500).json({ 
          message: "Image upload failed", 
          error: uploadErr.message 
        });
      }
    }

    if (req.body.images) {
      try {
        const bodyImages = Array.isArray(req.body.images) 
          ? req.body.images 
          : [req.body.images];
        
        const processedBodyImages = await processImageArray(bodyImages);
        imageUrls = [...imageUrls, ...processedBodyImages];
      } catch (uploadErr) {
        return res.status(500).json({ 
          message: "Image processing failed", 
          error: uploadErr.message 
        });
      }
    }

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

      const images = imageUrls.length > 0 ? imageUrls : undefined;

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
