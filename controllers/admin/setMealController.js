const { executeQuery } = require("../../utils/db/dbUtils");
const { getUTCDateTime } = require("../../utils/date/dateUtils");
const uploadImage = require("../../utils/uploadMedia/uploadImage"); // adjust if needed

// Validation function
// Validation function
const validateSetMealInput = (mealName, price, categories, image) => {
  if (!mealName || !price) {
    return { valid: false, message: "Meal name and price are required." };
  }
  if (isNaN(price) || Number(price) <= 0) {
    return { valid: false, message: "Price must be a positive number." };
  }

  let categoriesArray;
  try {
    categoriesArray = JSON.parse(categories);
  } catch (err) {
    return { valid: false, message: "Invalid categories format." };
  }
  if (!Array.isArray(categoriesArray) || categoriesArray.length === 0) {
    return { valid: false, message: "At least one category is required." };
  }

  for (const cat of categoriesArray) {
    if (!cat.cat_name) {
      return { valid: false, message: "Each category must have a name." };
    }
    if (!Array.isArray(cat.fields) || cat.fields.length === 0) {
      return { valid: false, message: `Category "${cat.cat_name}" must have items.` };
    }
    for (const field of cat.fields) {
      if (!field.itemName) {
        return { valid: false, message: `Each item in category "${cat.cat_name}" must have an itemName.` };
      }
      if (field.extra_charge === undefined || isNaN(field.extra_charge)) {
        return { valid: false, message: `Each item in category "${cat.cat_name}" must have a valid extra_charge.` };
      }
    }
  }

  if (!image) {
    return { valid: false, message: "Image is required." };
  }

  return { valid: true, categoriesArray };
};

// Controller
const createSetMealMenu = async (req, res) => {
  try {
    console.log("Creating Set Meal Menu with data:", req.body);
    const { mealName, price, categories } = req.body;
    const image = req.files && req.files.image ? req.files.image : null;

    // Validate inputs
    const validation = validateSetMealInput(mealName, price, categories, image);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const categoriesArray = validation.categoriesArray;

    // Upload Image
    const imagePath = await uploadImage(image);
    console.log("imagePath:", imagePath);

    let status="available"
    // Insert Set Meal
    const insertSetMeal = `
      INSERT INTO set_meal_menu 
        (set_meal_name, price, image_path, status, updated_at, created_at) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    const currentDateTime = getUTCDateTime();
    const setMealValues = [mealName, price, imagePath, status, currentDateTime, currentDateTime];
    const result = await executeQuery(insertSetMeal, setMealValues);
    console.log("result:", result);

    const setMealId = result.insertId;

    // Insert Categories + Fields (items)
    for (const cat of categoriesArray) {
      if (!cat.fields || cat.fields.length === 0) continue;

      const placeholders = cat.fields.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
      const values = cat.fields.flatMap(field => [
        setMealId,
        cat.cat_name,               // category name
        field.itemName,             // item name
        cat.choose || 0,            // how many can be chosen
        field.extra_charge || 0,    // item’s extra charge
        currentDateTime,
        currentDateTime,
      ]);

      const insertCategory = `
        INSERT INTO set_meal_items 
          (set_meal_id, category_name, item_name, max_choices, extra_charge, updated_at, created_at) 
        VALUES ${placeholders}`;
      await executeQuery(insertCategory, values);
    }

    return res.status(201).json({ message: "Set Meal Menu created successfully." });
  } catch (error) {
    console.error("Error in /createSetMealMenu:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


module.exports = {
  createSetMealMenu,
};
