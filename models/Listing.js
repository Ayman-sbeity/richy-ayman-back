import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    property_type: { type: String },
    listing_type: { type: String, enum: ['Sale', 'Rent'] },
    price: { type: Number },
    location: { type: String },
    city: { type: String },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    area: { type: Number },
    parking_spaces: { type: Number },
    year_built: { type: Number },
    features: { type: [String] },
    images: { type: [String] },
    contact_name: { type: String },
    contact_email: { type: String },
    contact_phone: { type: String },
    agency_name: { type: String },
    license_number: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    expires_at: { type: Date },
  },
  { timestamps: true }
);

// Index for queries
listingSchema.index({ user_id: 1, status: 1 });

export default mongoose.model('Listing', listingSchema);
