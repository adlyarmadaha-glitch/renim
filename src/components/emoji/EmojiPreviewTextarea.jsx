const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from "react";

let emojiCache = null;
async function getEmojiMap() {
  if (emojiCache) return emojiCache;
  const list = await db.entities.CustomEmoji.list().catch(() => []);
  emojiCache = {};
  list.forEach((e) => { emojiCache[e.name] = { url: e.url, is_animated: e.is_animated }; });
  setTimeout(() => { emojiCache = null; }, 60000);
  return emojiCache;
}

// Parse text into tokens: plain text + custom emoji [:name:]
function parseTokens(text, emojiMap) {
  if (!text.includes("[:")) return [{ type: "text", value: text }];
  const regex = /\[:([\w-]+):\]/g;
  const result = [];
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) result.push({ type: "text", value: text.slice(last, match.index) });
    const name = match[1];
    if (emojiMap[name]) {
      result.push({ type: "emoji", name, url: emojiMap[name].url });
    } else {
      result.push({ type: "text", value: match[0] });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) result.push({ type: "text", value: text.slice(last) });
  return result;
}

/**
 * EmojiPreviewTextarea — shows a live preview overlay of custom emojis
 * while typing in a regular <textarea>.
 *
 * Props:
 *   value, onChange, placeholder, maxLength, onKeyDown, className
 */
export default function EmojiPreviewTextarea({ value, onChange, placeholder, maxLength, onKeyDown, className = "" }) {
  const [emojiMap, setEmojiMap] = useState({});
  const textareaRef = useRef(null);

  useEffect(() => {
    getEmojiMap().then(setEmojiMap);
  }, []);

  const tokens = parseTokens(value, emojiMap);
  const hasCustomEmoji = tokens.some((t) => t.type === "emoji");

  return (
    <div className="relative w-full">
      {/* Real textarea — invisible text when there are custom emojis so the overlay shows */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        onKeyDown={onKeyDown}
        className={`${className} ${hasCustomEmoji ? "text-transparent caret-foreground" : ""}`}
        style={{ resize: "none" }}
      />

      {/* Overlay that mirrors the textarea content with emoji images */}
      {hasCustomEmoji && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none overflow-hidden px-3 py-2 text-sm text-foreground whitespace-pre-wrap break-words`}
          style={{ fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit" }}
        >
          {tokens.map((t, i) =>
            t.type === "emoji" ? (
              <img key={i} src={t.url} alt={`:${t.name}:`} title={`:${t.name}:`}
                className="inline-block w-5 h-5 object-contain align-middle mx-0.5" />
            ) : (
              <span key={i}>{t.value}</span>
            )
          )}
        </div>
      )}
    </div>
  );
}