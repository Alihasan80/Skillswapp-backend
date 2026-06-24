import Skill from "../models/skill.model.js";

// GET /api/skills
export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ user: req.user.id })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/skills
export const addSkill = async (req, res) => {
  try {
    const { title, category, level } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Skill title required" });
    }

    const skill = await Skill.create({
      user: req.user.id,
      title,
      category,
      level,
    });

    req.io.emit("skill:added", skill);
    res.status(201).json(skill);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/skills/:id
export const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    req.io.emit("skill:updated", skill);
    res.json(skill);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  DELETE /api/skills/:id
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // only owner can delete
    if (String(skill.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Skill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Skill deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};