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

  const RENDER_URI = "https://blogproject-demo.onrender.com";

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
  const handleCancelEdit = () => {
    setNewTitle("");
    setNewContent("");
    if (setEditId) setEditId(null);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col justify-between">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 1. TOPIC / PAGE HEADER */}
          <header className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Latest <span className="text-orange-500">Blogs</span> 📚
            </h2>
            <p className="mt-3 text-slate-500 text-base">
              Thoughts, tutorials, and stories curated for curious minds.
            </p>
          </header>

          {/* TWO-COLUMN CONTAINER */}
          <div
            className={`grid grid-cols-1 ${
              admin ? "lg:grid-cols-12 gap-8 items-start" : "max-w-4xl mx-auto"
            }`}
          >
            {/* 2. LEFT COLUMN: Sticky Blog Form */}
            {admin && (
              <aside className="lg:col-span-5 lg:sticky lg:top-8 bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-slate-200/80 transition-all">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                    {!editId ? "Create New Post" : "Edit Blog Post"}
                  </h3>

                  {editId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className=" font-semibold px-2.5 py-1 rounded-md border border-red-400 hover:bg-red-200 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handleNewBlogSubmit}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Blog Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter a catchy headline..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Content
                    </label>
                    <textarea
                      placeholder="Write your blog content here..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all resize-y"
                      rows="7"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-semibold shadow-sm shadow-orange-500/20 transition-all duration-200 cursor-pointer"
                  >
                    {!editId ? "Publish Blog" : "Save Changes"}
                  </button>
                </form>
              </aside>
            )}

            {/* 3. RIGHT COLUMN: Blog Posts Feed */}
            <main
              className={
                admin
                  ? "lg:col-span-7 flex flex-col gap-6"
                  : "flex flex-col gap-6"
              }
            >
              {/* Feed Count Bar */}
              {!isLoading && blogs.length > 0 && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Published Posts ({blogs.length})
                  </span>
                </div>
              )}

              {/* Loading State (Skeleton Cards) */}
              {isLoading ? (
                <div className="flex flex-col gap-6">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-sm animate-pulse"
                    >
                      <div className="h-3 bg-slate-200 rounded w-24 mb-4"></div>
                      <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2.5 mb-6">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <div className="h-8 bg-slate-100 rounded-full w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                /* Empty State */
                <div className="text-center py-20 px-6 bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-600 text-lg font-semibold">
                    No blogs published yet
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    {admin
                      ? "Use the editor on the left to publish your first post."
                      : "Check back soon for fresh updates!"}
                  </p>
                </div>
              ) : (
                /* Blog Cards List */
                blogs.map((blog) => (
                  <article
                    key={blog._id}
                    className={`group bg-white rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
                      editId === blog._id
                        ? "border-orange-400 ring-2 ring-orange-500/20 shadow-md"
                        : "border-slate-200/70 shadow-sm hover:shadow-lg hover:shadow-slate-200/40"
                    }`}
                  >
                    {/* Date & Active Edit Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <svg
                          className="w-3.5 h-3.5 text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{blog.date}</span>
                      </div>

                      {editId === blog._id && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                          Currently Editing
                        </span>
                      )}
                    </div>

                    {/* Blog Title */}
                    <h3 className="font-bold text-xl sm:text-2xl text-slate-900 group-hover:text-orange-500 transition-colors duration-200 mb-3 leading-snug">
                      {blog.newTitle}
                    </h3>

                    {/* Blog Content */}
                    <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-line">
                      {blog.newContent}
                    </p>

                    {/* Card Footer: Likes & Admin Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => handleLike(blog._id)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all duration-200 cursor-pointer border border-slate-200/60 hover:border-rose-200"
                      >
                        <svg
                          className="w-4 h-4 text-rose-500 fill-rose-500/20 group-hover:fill-rose-500 transition-colors"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{blog.likes}</span>
                        <span className="text-xs text-slate-400">
                          {blog.likes === 1 ? "Like" : "Likes"}
                        </span>
                      </button>

                      {/* Admin Controls */}
                      {admin && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(blog)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(blog._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </main>
          </div>
        </div>

        {/* 4. FOOTER */}
        <Footer />
      </div>
    </>
  );
}

export default Blogs;
