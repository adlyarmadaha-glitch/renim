const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef, useCallback } from "react";

let emojiCache = null;
async function getEmojiList() {
  if (emojiCache) return emojiCache;
  const list = await db.entities.CustomEmoji.list().catch(() => []);
  emojiCache = list;
  setTimeout(() => { emojiCache = null; }, 60000);
  return list;
}

// Parse text into segments: plain text + custom emoji tokens
function parseSegments(text, emojiMap) {
  const regex = /\[:([\w-]+):\]/g;
  const segments = [];
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) segments.push({ type: "text", value: text.slice(last, match.index) });
    const name = match[1];
    if (emojiMap[name]) {
      segments.push({ type: "emoji", name, url: emojiMap[name], raw: match[0] });
    } else {
      segments.push({ type: "text", value: match[0] });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });
  return segments;
}

/**
 * EmojiTextarea — a contentEditable-based textarea that renders custom emojis inline.
 * Exposes same props as a regular textarea: value, onChange, placeholder, maxLength, className
 */
export default function EmojiTextarea({ value, onChange, placeholder, maxLength, className = "" }) {
  const [emojiMap, setEmojiMap] = useState({});
  const editorRef = useRef(null);
  const isComposingRef = useRef(false);
  const lastValueRef = useRef(value);

  useEffect(() => {
    getEmojiList().then((list) => {
      const map = {};
      list.forEach((e) => { map[e.name] = e.url; });
      setEmojiMap(map);
    });
  }, []);

  // Render value into editor when value changes externally (e.g. clear on submit)
  useEffect(() => {
    if (!editorRef.current) return;
    if (value === lastValueRef.current) return;
    lastValueRef.current = value;
    renderToEditor(value);
  }, [value, emojiMap]);

  const renderToEditor = useCallback((text) => {
    if (!editorRef.current) return;
    const segments = parseSegments(text, emojiMap);
    // Build HTML
    let html = "";
    segments.forEach((seg) => {
      if (seg.type === "emoji") {
        html += `<img src="${seg.url}" alt=":${seg.name}:" title=":${seg.name}:" data-emoji="${seg.raw}" class="inline-block w-5 h-5 object-contain align-middle mx-0.5 pointer-events-none select-none" draggable="false" />`;
      } else {
        html += seg.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
      }
    });
    editorRef.current.innerHTML = html || "";
    // Move cursor to end
    const sel = window.getSelection();
    if (sel && editorRef.current.childNodes.length > 0) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [emojiMap]);

  // Extract raw text from editor (replace img tags back to [:name:])
  const extractText = useCallback(() => {
    if (!editorRef.current) return "";
    let text = "";
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeName === "IMG") {
        text += node.getAttribute("data-emoji") || "";
      } else if (node.nodeName === "BR") {
        text += "\n";
      } else {
        node.childNodes.forEach(walk);
        if (node.nodeName === "DIV" || node.nodeName === "P") text += "\n";
      }
    };
    editorRef.current.childNodes.forEach(walk);
    return text.replace(/\n$/, ""); // trim trailing newline
  }, []);

  const handleInput = useCallback(() => {
    if (isComposingRef.current) return;
    const text = extractText();
    if (maxLength && text.length > maxLength) return;
    lastValueRef.current = text;
    onChange?.({ target: { value: text } });
  }, [extractText, onChange, maxLength]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) return; // allow shift+enter
    // Prevent newlines in single-line scenarios — we allow multiline here
  };

  const handleCompositionStart = () => { isComposingRef.current = true; };
  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    handleInput();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      className={`min-h-[80px] px-3 py-2 text-sm outline-none break-words whitespace-pre-wrap overflow-y-auto
        empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none
        ${className}`}
      style={{ wordBreak: "break-word" }}
      spellCheck
    />
  );
}