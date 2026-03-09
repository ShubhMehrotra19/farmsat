"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    googleTranslateElementInit: () => void
  }

  namespace google {
    namespace translate {
      const TranslateElement: {
        new (options: any, element: string): any
        InlineLayout: {
          SIMPLE: 0
          VERTICAL: 1
          HORIZONTAL: 2
        }
      }
    }
  }
}

export function GoogleTranslate() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          // 'en' + common Indian languages
          includedLanguages: "en,hi,bn,te,mr,ta,ur,gu,kn,ml,pa",
          // SIMPLE layout creates the compact dropdown.
          // VERTICAL creates an open list. User likely wants a dropdown.
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      )
    }

    const scriptId = "google-translate-script"
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script")
      script.id = scriptId
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-20 right-6 z-50">
      <div id="google_translate_element" className="google-translate-container" />
      <style jsx global>{`
        /* Container styling - More prominent */
        .google-translate-container {
          position: relative;
          z-index: 1000;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
        }

        /* The main dropdown button - Enhanced styling */
        .goog-te-gadget-simple {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
          padding: 10px 16px !important;
          border-radius: 50px !important; /* More rounded */
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          backdrop-filter: blur(10px) !important;
        }

        .goog-te-gadget-simple:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4) !important;
        }

        .goog-te-gadget-simple:active {
          transform: translateY(0) !important;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3) !important;
        }

        /* Hide the Google logo icon inside the button */
        .goog-te-gadget-simple img {
          display: none !important;
        }

        /* Text styling inside button - Enhanced */
        .goog-te-menu-value {
          color: #ffffff !important;
          font-family: var(--font-manrope), "Inter", sans-serif !important;
          font-weight: 600 !important;
          font-size: 0.9rem !important;
          display: flex !important;
          align-items: center !important;
          margin: 0 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
          letter-spacing: 0.025em !important;
        }

        /* "Select Language" text */
        .goog-te-menu-value span:first-child {
          color: #ffffff !important;
          font-weight: 700 !important;
        }

        /* Vertical separator - hide it */
        .goog-te-menu-value span:nth-child(2) {
          display: none !important;
        }

        /* Dropdown arrow - Enhanced styling */
        .goog-te-menu-value span:last-child {
          color: #ffffff !important;
          font-size: 12px !important;
          margin-left: 6px !important;
          opacity: 0.9 !important;
          font-weight: bold !important;
        }

        /* HIDING THE 'POWERED BY GOOGLE' TEXT AND FRAME */

        /* This container often holds 'Powered by Google' */
        .goog-te-gadget {
          color: transparent !important;
          font-size: 0 !important;
        }

        .goog-te-gadget > div {
          display: inline-block !important;
        }

        /* The banner frame that appears at top of body */
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }

        body {
          top: 0px !important;
        }

        /* Hiding hover tooltips */
        #goog-gt-tt {
          display: none !important;
          visibility: hidden !important;
        }

        /* The actual dropdown menu styling - Enhanced */
        .goog-te-menu-frame {
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border-radius: 12px !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          z-index: 10000 !important;
          backdrop-filter: blur(20px) !important;
          background: rgba(255, 255, 255, 0.95) !important;
        }

        /* Menu items styling */
        .goog-te-menu2-item div {
          font-family: var(--font-manrope), "Inter", sans-serif !important;
          font-size: 0.875rem !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
        }

        .goog-te-menu2-item:hover div {
          background-color: rgba(16, 185, 129, 0.1) !important;
          color: #059669 !important;
        }

        /* Selected language styling */
        .goog-te-menu2-item-selected div {
          background-color: rgba(16, 185, 129, 0.2) !important;
          color: #059669 !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  )
}
