// src/pages/DashboardPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

// ── Mock post data ────────────────────────────────────────────────────────────
const MOCK_STORIES = [
  { id: 1, name: "your_story", avatar: null, isYou: true },
  { id: 2, name: "alex.photo", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex" },
  { id: 3, name: "sam_travels", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam" },
  { id: 4, name: "mia.art", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mia" },
  { id: 5, name: "dev_logs", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev" },
  { id: 6, name: "nature.lens", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nature" },
];

const MOCK_POSTS = [
  {
    id: 1,
    user: "alex.photo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    image: "https://picsum.photos/seed/post1/600/600",
    likes: 1248,
    caption: "Golden hour never disappoints ✨ #photography #nature",
    time: "2 hours ago",
    liked: false,
    saved: false,
  },
  {
    id: 2,
    user: "sam_travels",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    image: "https://picsum.photos/seed/post2/600/600",
    likes: 876,
    caption: "Exploring hidden streets in Portugal 🇵🇹 #travel #explore",
    time: "5 hours ago",
    liked: false,
    saved: false,
  },
  {
    id: 3,
    user: "mia.art",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mia",
    image: "https://picsum.photos/seed/post3/600/600",
    likes: 2341,
    caption: "New piece in the studio 🎨 What do you feel when you look at this?",
    time: "1 day ago",
    liked: false,
    saved: false,
  },
];

// ── Heart icon ────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className={`w-6 h-6 ${filled ? "fill-red-500 stroke-red-500" : "fill-none stroke-current"}`} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className={`w-6 h-6 ${filled ? "fill-current" : "fill-none stroke-current"}`} strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

// ── Post card ─────────────────────────────────────────────────────────────────
const PostCard = ({ post, onLike, onSave }) => (
  <article className="bg-white border border-[#dbdbdb] rounded-xl overflow-hidden mb-6">
    {/* Header */}
    <header className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#c13584] ring-offset-1">
        <img src={post.avatar} alt={post.user} className="w-full h-full object-cover" />
      </div>
      <span className="text-sm font-semibold text-[#262626] flex-1">{post.user}</span>
      <button className="text-[#262626] text-xl font-bold leading-none">···</button>
    </header>

    {/* Image */}
    <div className="w-full aspect-square bg-[#fafafa] overflow-hidden">
      <img
        src={post.image}
        alt="Post"
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    </div>

    {/* Actions */}
    <div className="px-4 pt-3 pb-1">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => onLike(post.id)} className={`transition-transform active:scale-125 ${post.liked ? "text-red-500" : "text-[#262626]"}`}>
          <HeartIcon filled={post.liked} />
        </button>
        <button className="text-[#262626]"><CommentIcon /></button>
        <button className="text-[#262626]"><ShareIcon /></button>
        <button onClick={() => onSave(post.id)} className={`ml-auto ${post.saved ? "text-[#262626]" : "text-[#262626]"}`}>
          <BookmarkIcon filled={post.saved} />
        </button>
      </div>
      <p className="text-sm font-semibold text-[#262626]">
        {post.likes.toLocaleString()} likes
      </p>
      <p className="text-sm mt-1">
        <span className="font-semibold text-[#262626] mr-1">{post.user}</span>
        <span className="text-[#262626]">{post.caption}</span>
      </p>
      <p className="text-[11px] text-[#8e8e8e] mt-1 uppercase tracking-wide">{post.time}</p>
    </div>
  </article>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const handleSave = (id) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── Top navigation bar ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#dbdbdb]">
        <div className="max-w-[935px] mx-auto px-4 h-[54px] flex items-center justify-between">
          <h1 className="font-logo text-[28px] text-[#262626]">Instagram</h1>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex items-center gap-2 bg-[#efefef] rounded-lg px-3 py-1.5 w-64">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#8e8e8e] fill-none stroke-current" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input placeholder="Search" className="bg-transparent text-sm outline-none w-full text-[#262626] placeholder-[#8e8e8e]" />
          </div>

          {/* User avatar + logout */}
          <div className="relative">
            <button onClick={() => setShowLogoutMenu((p) => !p)} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#c13584] ring-offset-1 cursor-pointer">
                <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="me" className="w-full h-full object-cover" />
              </div>
            </button>

            {showLogoutMenu && (
              <div className="absolute right-0 top-11 bg-white border border-[#dbdbdb] rounded-xl shadow-xl w-52 py-1 z-50 animate-fade-up">
                <div className="px-4 py-3 border-b border-[#dbdbdb]">
                  <p className="font-semibold text-sm text-[#262626]">{user?.name}</p>
                  <p className="text-xs text-[#8e8e8e] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-[935px] mx-auto px-4 pt-6 flex gap-8">
        {/* ── Feed column ──────────────────────────────────────────────────── */}
        <main className="flex-1 max-w-[614px]">
          {/* Stories */}
          <div className="bg-white border border-[#dbdbdb] rounded-xl p-4 mb-6 overflow-x-auto">
            <div className="flex gap-4">
              {MOCK_STORIES.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
                  <div className={`w-14 h-14 rounded-full p-0.5 ${story.isYou ? "bg-[#dbdbdb]" : "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"}`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                      {story.isYou ? (
                        <div className="w-full h-full rounded-full bg-[#efefef] flex items-center justify-center text-xl">
                          ➕
                        </div>
                      ) : (
                        <img src={story.avatar} alt={story.name} className="w-full h-full object-cover rounded-full" />
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#262626] max-w-[56px] truncate text-center">{story.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} />
          ))}
        </main>

        {/* ── Sidebar (desktop only) ────────────────────────────────────── */}
        <aside className="hidden lg:block w-[293px] flex-shrink-0 pt-2">
          {/* Profile summary */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#c13584] ring-offset-1">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#262626] truncate">{user?.name}</p>
              <p className="text-xs text-[#8e8e8e] truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-[#0095f6] hover:text-[#1877f2] transition-colors"
            >
              Log out
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#8e8e8e]">Suggested for you</span>
            <button className="text-xs font-semibold text-[#262626] hover:text-[#8e8e8e]">See All</button>
          </div>
          {MOCK_STORIES.filter((s) => !s.isYou).slice(0, 4).map((s) => (
            <div key={s.id} className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#262626] truncate">{s.name}</p>
                <p className="text-xs text-[#8e8e8e]">Suggested for you</p>
              </div>
              <button className="text-xs font-semibold text-[#0095f6] hover:text-[#1877f2]">Follow</button>
            </div>
          ))}

          <p className="text-[11px] text-[#8e8e8e] mt-6 leading-relaxed">
            About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language
          </p>
          <p className="text-[11px] text-[#8e8e8e] mt-2">© 2024 INSTAGRAM FROM META</p>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;