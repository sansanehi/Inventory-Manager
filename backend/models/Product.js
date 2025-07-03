const mongoose = require("mongoose");
const createSlug = require("../utils/createSlug");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Product description is required"]
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },
    image: {
      type: String,
      required: [true, "Product image is required"]
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    colors: [{
      type: String,
      trim: true
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviews: {
      type: Number,
      default: 0
    },
    slug: {
      type: String,
    },
    cloudinary_id: {
      type: String,
    },
  },
  { timestamps: true }
);

// Add text index for search functionality
productSchema.index({ name: 'text', description: 'text', category: 'text' });

productSchema.pre("save", async function (next) {
  // if(!this.isModified("slug")){
  //     return next()
  // }

  const slug = createSlug(this.slug);
  this.slug = slug;
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
