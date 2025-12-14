"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    googleTranslateElementInit: () => void
  }

  namespace google {
    namespace translate {
      const TranslateElement: {
        new(options: any, element: string): any
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
    <div className="fixed top-24 right-4 z-50">
      <div id="google_translate_element" className="google-translate-container" />
      <style jsx global>{`
        /* Container styling */
        .google-translate-container {
          position: relative;
          z-index: 1000;
        }

        /* The main dropdown button */
        .goog-te-gadget-simple {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          padding: 8px 12px !important;
          border-radius: 9999px !important; /* Pill shape */
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          transition: all 0.2s !important;
        }

        .goog-te-gadget-simple:hover {
          background-color: #f9fafb !important;
          border-color: #d1d5db !important;
        }

        /* Hide the Google logo icon inside the button */
        .goog-te-gadget-simple img {
          display: none !important;
        }

        /* Text styling inside button */
        .goog-te-menu-value {
          color: #059669 !important; /* Emerald-600 */
          font-family: var(--font-manrope), sans-serif !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          display: flex !important;
          align-items: center !important;
          margin: 0 !important;
        }

        /* "Select Language" text */
        .goog-te-menu-value span:first-child {
          color: #059669 !important;
          text-decoration: none !important;
        }

        /* Vertical separator - hide it */
        .goog-te-menu-value span:nth-child(2) {
          display: none !important;
        }

        /* Dropdown arrow - style it or keep default */
        .goog-te-menu-value span:last-child {
          color: #059669 !important;
          font-size: 10px !important;
          margin-left: 4px !important;
          opacity: 0.8 !important;
        }

        /* HIDING THE 'POWERED BY GOOGLE' TEXT AND FRAME */

        /* This container often holds 'Powered by Google' */
        .goog-te-gadget {
          color: transparent !important;
          font-size: 0 !important;
        }
        
        .goog-te-gadget > div {
          display: inline-block !important; /* Keeps the dropdown visible */
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

        /* The actual dropdown menu styling */
        .goog-te-menu-frame {
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
          border-radius: 8px !important;
          z-index: 10000 !important;
        }
      `}</style>
    </div>
  )
}
