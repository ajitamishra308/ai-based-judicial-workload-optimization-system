import React from 'react'

/**
 * Decorative background watermark: a balance scale with "AI" on one pan
 * and a book icon on the other. The beam slowly tilts back and forth
 * (sometimes AI dips, sometimes the book dips) via CSS keyframes.
 * In dark mode it gets a soft gold glow filter instead of a flat fill.
 */
export default function ScaleWatermark({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 600 500"
        className="w-full h-full opacity-[0.07] dark:opacity-[0.18]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="scaleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <style>{`
          @keyframes tiltBeam {
            0%   { transform: rotate(0deg); }
            25%  { transform: rotate(-7deg); }
            50%  { transform: rotate(0deg); }
            75%  { transform: rotate(7deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes bobLeftPan {
            0%   { transform: translateY(0px); }
            25%  { transform: translateY(18px); }
            50%  { transform: translateY(0px); }
            75%  { transform: translateY(-18px); }
            100% { transform: translateY(0px); }
          }
          @keyframes bobRightPan {
            0%   { transform: translateY(0px); }
            25%  { transform: translateY(-18px); }
            50%  { transform: translateY(0px); }
            75%  { transform: translateY(18px); }
            100% { transform: translateY(0px); }
          }
          #scale-beam { animation: tiltBeam 9s ease-in-out infinite; transform-origin: 300px 160px; }
          #scale-left-pan { animation: bobLeftPan 9s ease-in-out infinite; }
          #scale-right-pan { animation: bobRightPan 9s ease-in-out infinite; }
          .scale-root { color: #0f1b2d; }
          .dark .scale-root { color: #e0bc4f; filter: url(#scaleGlow); }
        `}</style>

        <g className="scale-root">
          {/* stand */}
          <rect x="292" y="160" width="16" height="260" fill="currentColor" />
          <path d="M 220 420 L 380 420 L 400 460 L 200 460 Z" fill="currentColor" />
          <circle cx="300" cy="150" r="14" fill="currentColor" />

          {/* beam + pans (this whole group tilts) */}
          <g id="scale-beam">
            <rect x="90" y="152" width="420" height="10" rx="5" fill="currentColor" />

            {/* left pan: AI */}
            <g id="scale-left-pan">
              <line x1="110" y1="157" x2="110" y2="240" stroke="currentColor" strokeWidth="4" />
              <line x1="150" y1="157" x2="150" y2="240" stroke="currentColor" strokeWidth="4" />
              <path d="M 90 240 Q 130 290 170 240 Z" fill="none" stroke="currentColor" strokeWidth="6" />
              <text x="130" y="235" textAnchor="middle" fontSize="34" fontWeight="700" fill="currentColor" fontFamily="Georgia, serif">
                AI
              </text>
            </g>

            {/* right pan: Book */}
            <g id="scale-right-pan">
              <line x1="450" y1="157" x2="450" y2="240" stroke="currentColor" strokeWidth="4" />
              <line x1="490" y1="157" x2="490" y2="240" stroke="currentColor" strokeWidth="4" />
              <path d="M 430 240 Q 470 290 510 240 Z" fill="none" stroke="currentColor" strokeWidth="6" />
              <g transform="translate(448, 205)">
                <path d="M0 0 H40 V32 H0 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                <line x1="20" y1="0" x2="20" y2="32" stroke="currentColor" strokeWidth="3" />
                <line x1="6" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2" />
                <line x1="6" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
                <line x1="24" y1="9" x2="34" y2="9" stroke="currentColor" strokeWidth="2" />
                <line x1="24" y1="16" x2="34" y2="16" stroke="currentColor" strokeWidth="2" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
