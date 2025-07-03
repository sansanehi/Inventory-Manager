const joi = require("joi");
const supabase = require("../database/supabaseClient");

const createCategory = async (req, res) => {
  try {
    const schema = joi.object({
      category: joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const { category } = req.body;
    const { data: categoryExists, error: existsError } = await supabase
      .from("categories")
      .select("*")
      .eq("category", category)
      .single();
    if (existsError && existsError.code !== "PGRST116")
      return res.status(500).json(existsError.message);
    if (categoryExists)
      return res.status(409).json(`category ${category} already exists.`);
    const { error: insertError } = await supabase.from("categories").insert([
      {
        category: req.body.category,
        slug: category,
      },
    ]);
    if (insertError) return res.status(500).json(insertError.message);
    return res.status(200).json("category has been created.");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const categories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*");
    if (error) return res.status(500).json(error.message);
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const category = async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(404).json("category was not found.");
    const { data: category, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error && error.code !== "PGRST116")
      return res.status(500).json(error.message);
    if (!category) return res.status(404).json("category was not found.");
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const updateCategory = async (req, res) => {
  try {
    const schema = joi.object({
      category: joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    const id = req.params.id;
    const { data: categories, error: findError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
    if (findError && findError.code !== "PGRST116")
      return res.status(500).json(findError.message);
    if (!categories) return res.status(404).json("category was not found.");
    const updatedFields = {
      category: req.body.category || categories.category,
    };
    const { data: update_category, error: updateError } = await supabase
      .from("categories")
      .update(updatedFields)
      .eq("id", id)
      .single();
    if (updateError) return res.status(500).json(updateError.message);
    return res.status(201).json(update_category);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(404).json("category was not found.");
    const { data: category, error: findError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single();
    if (findError && findError.code !== "PGRST116")
      return res.status(500).json(findError.message);
    if (!category) return res.status(404).json("category was not found.");
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("slug", slug);
    if (deleteError) return res.status(500).json(deleteError.message);
    return res.status(200).json("category has been deleted.");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = {
  createCategory,
  categories,
  category,
  updateCategory,
  deleteCategory,
};
