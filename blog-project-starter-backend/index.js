// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connection Successfull");
});

// Define Schema
const blogSchema = new mongoose.Schema({
  newTitle: String,
  newContent: String,
  date: String,
  likes: Number,
});

const Blog = mongoose.model("Blog", blogSchema);

// Routes
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({});
    console.log(blogs);
    res.send(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update likes
app.patch("/api/blogs/like/:id", async (req, res) => {
  try {
    console.log("like", req);

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Increment the likes of the blog post
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }, // This option returns the modified document rather than the original
    );

    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create blogs
app.post("/api/blogs", async (req, res) => {
  const blog = new Blog({
    newTitle: req.body.newTitle,
    newContent: req.body.newContent,
    date: req.body.date,
    likes: req.body.likes,
  });

  try {
    const newBlog = await blog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE (EDIT) blog by ID
app.put("/api/blogs/:id", async (req, res) => {
  try {
    console.log("update", req);
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        newTitle: req.body.newTitle,
        newContent: req.body.newContent,
      },
      { new: true }, // Returns the updated document to React
    );
    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE blog by ID
app.delete("/api/blogs/:id", async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log("Server running on port 5000"));
