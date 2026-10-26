const { Router } = require("express");
const Layout = require("../models/Layout");

const router = Router();

// Create a new layout
router.post("/", async (req, res, next) => {
  try {
    const layout = await Layout.create(req.body);
    res.status(201).json(layout);
  } catch (error) {
    next(error);
  }
});

// List saved layouts
router.get("/", async (_req, res, next) => {
  try {
    const layouts = await Layout.find().sort({ updatedAt: -1 }).lean();

    res.json(layouts);
  } catch (error) {
    next(error);
  }
});

// Get one layout
router.get("/:id", async (req, res, next) => {
  try {
    const layout = await Layout.findById(req.params.id);

    if (!layout) {
      return res.status(404).json({ message: "Layout not found" });
    }

    res.json(layout);
  } catch (error) {
    next(error);
  }
});

// Save the current equipment arrangement

 // Save the current equipment arrangement
router.put("/:id", async (req, res, next) => {
  try {
    const layout = await Layout.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!layout) {
      return res.status(404).json({ message: "Layout not found" });
    }

    res.json(layout);
  } catch (error) {
    next(error);
  }
});


// Delete a saved layout
router.delete("/:id", async (req, res, next) => {
  try {
    const layout = await Layout.findByIdAndDelete(req.params.id);

    if (!layout) {
      return res.status(404).json({ message: "Layout not found" });
    }

    res.json({ message: "Layout deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
