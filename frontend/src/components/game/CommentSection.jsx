import { useEffect, useState } from "react";
import { fetchComments, postComment, toggleCommentLike } from "../../lib/api";
import { icons } from "../ui/icons";

const AVATAR_COLORS = ["#2563eb", "#7c3aed", "#0f7a4d", "#d97706", "#dc2626", "#0891b2", "#be185d"];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(ts) {
  const seconds = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function totalCount(list) {
  return list.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);
}

/**
 * A lightweight YouTube-style discussion thread for a single game: a
 * composer up top, then a list of comments each with a like button and
 * one level of replies. Backed by lib/api.js's fetchComments/postComment/
 * toggleCommentLike - swap those for real endpoints and this component
 * doesn't need to change.
 */
export default function CommentSection({ gameId, title = "Comments" }) {
  const [status, setStatus] = useState("loading");
  const [list, setList] = useState([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const load = async () => {
    setStatus("loading");
    try {
      setList(await fetchComments(gameId));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const handlePost = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setPosting(true);
    try {
      await postComment(gameId, { text: value });
      setText("");
      await load();
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    const value = replyText.trim();
    if (!value) return;
    setPosting(true);
    try {
      await postComment(gameId, { text: value, parentId });
      setReplyText("");
      setReplyingTo(null);
      await load();
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (commentId) => {
    // Optimistic toggle so it feels instant, like YouTube's.
    setList((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, likedByMe: !c.likedByMe, likes: c.likes + (c.likedByMe ? -1 : 1) };
        }
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId ? { ...r, likedByMe: !r.likedByMe, likes: r.likes + (r.likedByMe ? -1 : 1) } : r
          ),
        };
      })
    );
    await toggleCommentLike(gameId, commentId);
  };

  return (
    <div>
      <h2 className="font-display font-semibold text-[var(--color-ink)] mb-4 flex items-center gap-2">
        <icons.chat className="h-4.5 w-4.5 text-[var(--color-ink-muted)]" />
        {title}
        {status === "success" && list.length > 0 && (
          <span className="text-sm font-normal text-[var(--color-ink-muted)]">{totalCount(list)}</span>
        )}
      </h2>

      <form onSubmit={handlePost} className="flex gap-3 mb-6">
        <Avatar name="You" />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment while you wait..."
            rows={text ? 2 : 1}
            className="w-full resize-none rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all duration-150"
          />
          {text && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setText("")}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={posting}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 active:scale-[0.97] transition-all duration-150"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </form>

      {status === "loading" && (
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-[var(--color-surface-sunken)] shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-24 rounded bg-[var(--color-surface-sunken)]" />
                <div className="h-3 w-3/4 rounded bg-[var(--color-surface-sunken)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-[var(--color-ink-muted)]">
          Couldn't load comments.{" "}
          <button onClick={load} className="text-[var(--color-accent)] font-medium hover:underline">
            Try again
          </button>
        </p>
      )}

      {status === "success" && list.length === 0 && (
        <p className="text-sm text-[var(--color-ink-muted)]">
          No comments yet — be the first to share your thoughts while you wait.
        </p>
      )}

      {status === "success" && list.length > 0 && (
        <div className="flex flex-col gap-5">
          {list.map((c, i) => (
            <div key={c.id} className="stagger-item" style={{ "--i": i }}>
              <CommentRow
                comment={c}
                onLike={() => handleLike(c.id)}
                onReplyClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                isReplying={replyingTo === c.id}
              />

              {replyingTo === c.id && (
                <form onSubmit={(e) => handleReply(e, c.id)} className="flex gap-3 mt-3 ml-12">
                  <Avatar name="You" size={28} />
                  <div className="flex-1">
                    <textarea
                      autoFocus
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${c.author}...`}
                      rows={1}
                      className="w-full resize-none rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all duration-150"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] transition-colors duration-150"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={posting}
                        className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 active:scale-[0.97] transition-all duration-150"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {c.replies?.length > 0 && (
                <div className="flex flex-col gap-4 mt-4 ml-12 border-l border-[var(--color-border)] pl-4">
                  {c.replies.map((r) => (
                    <CommentRow key={r.id} comment={r} size={28} onLike={() => handleLike(r.id)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentRow({ comment, size = 36, onLike, onReplyClick, isReplying }) {
  return (
    <div className="flex gap-3">
      <Avatar name={comment.author} size={size} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">{comment.author}</span>
          <span className="text-xs text-[var(--color-ink-faint)]">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-[var(--color-ink)] mt-0.5 break-words">{comment.text}</p>
        <div className="flex items-center gap-4 mt-1.5">
          <button
            type="button"
            onClick={onLike}
            className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors duration-150"
            aria-label={comment.likedByMe ? "Unlike" : "Like"}
          >
            {comment.likedByMe ? (
              <icons.heartFilled className="h-3.5 w-3.5 text-[var(--color-danger)]" />
            ) : (
              <icons.heart className="h-3.5 w-3.5" />
            )}
            {comment.likes > 0 && comment.likes}
          </button>
          {onReplyClick && (
            <button
              type="button"
              onClick={onReplyClick}
              className={`text-xs font-medium transition-colors duration-150 ${
                isReplying ? "text-[var(--color-accent)]" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, size = 36 }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="shrink-0 rounded-full flex items-center justify-center text-white font-semibold"
      style={{ height: size, width: size, backgroundColor: colorFor(name), fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}
