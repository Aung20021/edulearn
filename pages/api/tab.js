import { mongooseConnect } from "@/lib/mongoose";
import Tab from "@/models/Tab"; // Ensure this is the correct path to your Tab model

export default async function handler(req, res) {
  await mongooseConnect(); // Ensure database connection

  switch (req.method) {
    case "POST":
      return createTab(req, res);
    case "GET":
      return getTabs(req, res);
    case "PUT":
      return updateTab(req, res);
    case "DELETE":
      return deleteTab(req, res);
    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

// ✅ Create a new tab
async function createTab(req, res) {
  try {
    const { lessonId, name, resources = [] } = req.body;
    if (!lessonId || !name) {
      return res.status(400).json({ error: "Lesson ID and name are required" });
    }

    const newTab = await Tab.create({ lesson: lessonId, name, resources });
    res.status(201).json(newTab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Fetch tabs for a specific lesson
async function getTabs(req, res) {
  try {
    const { lessonId } = req.query;
    if (!lessonId) {
      return res.status(400).json({ error: "Lesson ID is required" });
    }

    const tabs = await Tab.find({ lesson: lessonId });
    res.status(200).json(tabs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Update a tab (e.g., assign resources)
async function updateTab(req, res) {
  try {
    const { tabId, resources } = req.body;
    if (!tabId) {
      return res.status(400).json({ error: "Tab ID is required" });
    }

    const updatedTab = await Tab.findByIdAndUpdate(
      tabId,
      { resources },
      { new: true }
    );
    res.status(200).json(updatedTab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Delete a tab
async function deleteTab(req, res) {
  try {
    const { tabId } = req.query; // Get tabId from query params
    if (!tabId) {
      return res.status(400).json({ error: "Tab ID is required" });
    }

    const tab = await Tab.findByIdAndDelete(tabId);
    if (!tab) {
      return res.status(404).json({ error: "Tab not found" });
    }

    res.status(200).json({ message: "Tab deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
