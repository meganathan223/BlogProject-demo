import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import Footer from "./common/Footer";
import auth from "../config/firebase";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState(null); // Stores _id when editing

  const RENDER_URI =
    "http://localhost:5000" || "https://blogproject-demo.onrender.com";

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);

    auth.onAuthStateChanged(function (user) {
      if (user) {
        if (user.uid === "8xArJ62DtbMUS2YQ8qzt80J4DXt2") {
          setAdmin(true);
        } else {
          setAdmin(false);
        }
      } else {
        console.log("User Logged out");
      }
    });

    axios
      .get(`${RENDER_URI}/api/blogs`)
      .then((res) => {
        console.log(res.data);
        setIsLoading(false);
        setBlogs(res.data);
      })
      .catch(() => {
        console.log("Error fetching data");
      });
  }, []);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleLike = async (blog_id) => {
    try {
      const response = await axios.patch(
        `${RENDER_URI}/api/blogs/like/${blog_id}`,
      );
      // After successfully updating the likes count in the backend, fetch the updated list of blogs
      if (response.status === 200) {
        axios
          .get(`${RENDER_URI}/api/blogs`)
          .then((res) => {
            setBlogs(res.data);
          })
          .catch(() => {
            console.log("Error fetching data");
          });
      }
    } catch (error) {
      console.error("Error liking the blog post:", error);
    }
  };

  const handleNewBlogSubmit = async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page
    const today = new Date();
    const date = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const likes = 0;

    try {
      if (editId) {
        if (editId) {
          // UPDATE existing blog
          const res = await axios.put(`${RENDER_URI}/api/blogs/${editId}`, {
            newTitle,
            newContent,
          });
          setBlogs(
            blogs.map((blog) => (blog._id === editId ? res.data : blog)),
          );
          setEditId(null); // Exit edit mode
        }
      } else {
        // CREATE new blog
        const res = await axios.post(`${RENDER_URI}/api/blogs`, {
          newTitle,
          date,
          newContent,
          likes,
        });

        setBlogs([res.data, ...blogs]);
      }

      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error("Error saving blog:", err);
    }
  };

  // LOAD DATA FOR EDIT: Populate inputs when Edit button is clicked
  const handleEdit = (blog) => {
    setEditId(blog._id);
    setNewTitle(blog.newTitle);
    setNewContent(blog.newContent);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scrolls up to your form
  };

  // Remove blog from MongoDB & UI
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${RENDER_URI}/api/blogs/${id}`);
      setBlogs(blogs.filter((blog) => blog._id !== id));
    } catch (err) {
      console.error("Error deleting blog:", err);
    }
  };

  return (
    <div className="blog-section py-14">
      <h2 className="text-center text-5xl font-bold mb-14">
        Latest <span className="text-orange-400">Blogs</span> 📚
      </h2>

      {/* Blog creation form */}

      {admin ? (
        <div
          className="blog-creation-form mb-8"
          style={{ width: "80%", margin: "auto" }}
        >
          <form onSubmit={handleNewBlogSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Blog Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="p-2 border rounded"
              required
            />
            <textarea
              placeholder="Blog Content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="p-2 border rounded"
              rows="4"
              required
            />
            <button
              type="submit"
              className="bg-orange-400 text-white p-2 rounded hover:bg-orange-600"
            >
              {!editId ? "Add Blog" : "Edit Blog"}
            </button>
          </form>
        </div>
      ) : (
        ""
      )}

      {isLoading && (
        <p className="text-center text-2xl block">Loading Blogs...</p>
      )}

      <div className="blogs-container grid grid-cols-1 md:grid-cols-2 gap-6 container mx-auto px-4 mb-4">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="blog-post m-8 border p-4 bg-white shadow-lg rounded-lg"
          >
            <h3 className="blog-title font-semibold text-2xl text-gray-800 mb-3">
              {blog.newTitle}
            </h3>
            <p className="blog-date text-gray-400 text-sm mb-4">{blog.date}</p>
            <p className="blog-content text-gray-600 mb-4">{blog.newContent}</p>
            <span
              className="text-blue-500 cursor-pointer "
              onClick={() => handleLike(blog._id)}
            >
              Like
            </span>
            <span className="ml-2">{blog.likes} likes</span>

            {admin && (
              <>
                <button
                  onClick={() => handleEdit(blog)}
                  className="px-4 py-1 rounded text-white bg-green-700 mx-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="px-4 py-1 rounded text-white bg-red-700 mx-4"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default Blogs;
