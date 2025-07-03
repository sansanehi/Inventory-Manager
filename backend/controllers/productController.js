const joi = require("joi");
const cloudinary = require("../config/cloudinary.config");
const supabase = require("../database/supabaseClient");

const addProduct = async (req, res) => {
  try {
    const schema = joi.object({
      product: joi.string().required().max(30).min(2),
      category: joi.string().required(),
      price: joi.string().required(),
      quantity: joi.number().required(),
      description: joi.string().required().max(250).min(15),
      image: joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const { product, category, price, quantity, description, image } = req.body;
    // Check if product exists
    const { data: productExists, error: existsError } = await supabase
      .from("products")
      .select("*")
      .eq("product", product)
      .single();
    if (existsError && existsError.code !== "PGRST116")
      return res.status(500).json(existsError.message);
    if (productExists)
      return res.status(400).json(`Product ${product} already exists`);
    const result = await cloudinary.uploader.upload(req.body.image);

    const { error: insertError } = await supabase.from("products").insert([
      {
        product,
        category,
        price,
        quantity,
        description,
        slug: product,
        image: result.secure_url,
      },
    ]);
    if (insertError) return res.status(500).json(insertError.message);
    return res.status(200).json("Product has been saved.");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const getProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*");
    if (error) return res.status(500).json(error.message);
    return res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116")
      return res.status(500).json(error.message);
    if (!product)
      return res.status(404).json(`product with ${id} doesnot exist.`);
    return res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const schema = joi.object({
      product: joi.string().required().max(30).min(2),
      category: joi.string().required(),
      price: joi.string().required(),
      quantity: joi.number().required(),
      description: joi.string().required().max(250).min(15),
      image: joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    const { product, category, price, quantity, description, image } = req.body;
    const { data: updated, error: updateError } = await supabase
      .from("products")
      .update({ product, category, price, quantity, description, image })
      .eq("id", id)
      .single();
    if (updateError && updateError.code !== "PGRST116")
      return res.status(500).json(updateError.message);
    if (!updated)
      return res.status(404).json(`product with ${id} doesnot exist.`);
    return res.status(200).json("Product has been updated.");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    // Check if product exists
    const { data: productCheck, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();
    if (checkError && checkError.code !== "PGRST116")
      return res.status(500).json(checkError.message);
    if (!productCheck)
      return res.status(404).json(`product with ${id} doesnot exist.`);
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (deleteError) return res.status(500).json(deleteError.message);
    return res.status(200).json("Product has been deleted.");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
