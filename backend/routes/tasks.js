const express = require("express");
const Task = require("../models/Task");
const { authMiddleware } = require("./auth");

const router = express.Router();

/*  ADD TASK */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || "in-progress",
      dueDate: req.body.dueDate,
      user: req.user.id
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*  GET TASKS  */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*  UPDATE TASK (e.g. mark completed) */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      dueDate: req.body.dueDate
    };

    // remove undefined fields so we only update what was sent
    Object.keys(updates).forEach(
      key => updates[key] === undefined && delete updates[key]
    );

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*  DELETE TASK  */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;