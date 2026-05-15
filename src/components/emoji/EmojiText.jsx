const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

let emojiCache = null;

async function getEmojiMap() {
  if (emojiCache) return emojiCache;
  const list = await db.entities.CustomEmoji.list().catch(() => []);
  emojiCache = {};
  list.forEach((e) => { emojiCache[e.name] = e.url; });
  // Expire cache after 60s
  setTimeout(() => { emojiCache = null; }, 60000);
  return emojiCache;
}

// Render text with custom emojis [:name:] replaced by images
export default function EmojiText({ text, className = "" }) {
  const [parts, setParts] = useState([{ type: "text", value: text }]);

  useEffect(() => {
    if (!text.includes("[:")) { setParts([{ type: "text", value: text }]); return; }
    getEmojiMap().then((map) => {
      const regex = /\[:([\w-]+):\]/g;
      const result = [];
      let last = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (match.index > last) result.push({ type: "text", value: text.slice(last, match.index) });
        const name = match[1];
        if (map[name]) {
          result.push({ type: "emoji", name, url: map[name] });
        } else {
          result.push({ type: "text", value: match[0] });
        }
        last = match.index + match[0].length;
      }
      if (last < text.length) result.push({ type: "text", value: text.slice(last) });
      setParts(result);
    });
  }, [text]);

  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.type === "emoji" ? (
          <img key={i} src={p.url} alt={`:${p.name}:`} title={`:${p.name}:`} className="inline-block w-5 h-5 object-contain align-middle mx-0.5" />
        ) : (
          <span key={i}>{p.value}</span>
        )
      )}
    </span>
  );
}