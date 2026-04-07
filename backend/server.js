const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { router: authRoutes } = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/taskflow")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("TaskFlow Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port http://localhost:5000");
});