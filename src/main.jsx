import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Apply saved theme on startup — fallback to system preference
const savedTheme = localStorage.getItem("renime_theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const resolvedTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
if (resolvedTheme === "light") {
  document.documentElement.classList.remove("dark");
  document.documentElement.classList.add("light");
} else {
  document.documentElement.classList.add("dark");
  document.documentElement.classList.remove("light");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)