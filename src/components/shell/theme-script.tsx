import Script from "next/script";

export const THEME_STORAGE_KEY = "theme";
export const ACCENT_STORAGE_KEY = "accent";

// Runs before the page is painted, so a saved theme or accent shows from the
// first frame instead of flashing in after hydration. It only reads two
// values from this browser's storage and sets attributes on <html>.
const script = `try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"||t==="system")d.dataset.theme=t;var a=parseFloat(localStorage.getItem(${JSON.stringify(
  ACCENT_STORAGE_KEY,
)}));if(isFinite(a)){d.dataset.accent="";d.style.setProperty("--accent-h",String(a%360))}}catch(e){}`;

export function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {script}
    </Script>
  );
}
