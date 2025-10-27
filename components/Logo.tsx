'use client'

// components/Logo.tsx
import React from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  showTagline?: boolean
}

export function Logo({
  size = "md",
  showText = true,
  showTagline = false
}: LogoProps) {
  const sizes = {
    sm: { icon: 40, text: 22, tagline: 8 },
    md: { icon: 80, text: 44, tagline: 11 },
    lg: { icon: 120, text: 60, tagline: 14 }
  }

  const iconSize = sizes[size].icon
  const textSize = sizes[size].text
  const taglineSize = sizes[size].tagline

  return (
    <div className="flex items-center gap-6">
      {/* Neural Icon */}
      <div
        className="relative"
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          filter: "drop-shadow(0 4px 12px rgba(59, 130, 246, 0.2))"
        }}
      >
        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 16px rgba(245, 158, 11, 0.8);
            }
            50% {
              transform: scale(1.15);
              box-shadow: 0 0 24px rgba(245, 158, 11, 1);
            }
          }

          @keyframes flow {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }

          .neural-icon:hover .neural-node {
            transform: scale(1.2);
          }

          .nn-center {
            animation: pulse 2s ease-in-out infinite;
          }

          .neural-connection {
            animation: flow 3s ease-in-out infinite;
          }

          .nc-1 { animation-delay: 0s; }
          .nc-2 { animation-delay: 0.5s; }
          .nc-3 { animation-delay: 1s; }
          .nc-4 { animation-delay: 1.5s; }
          .nc-5 { animation-delay: 2s; }
          .nc-6 { animation-delay: 2.5s; }
        `}</style>

        <div className="neural-icon">
          {/* Connections */}
          <div
            className="neural-connection nc-1 absolute rounded-sm"
            style={{
              height: "2.5px",
              width: `${iconSize * 0.35}px`,
              top: `${iconSize * 0.15}px`,
              left: `${iconSize * 0.5}px`,
              transformOrigin: "left",
              transform: "rotate(38deg)",
              background: "linear-gradient(90deg, rgba(59, 130, 246, 0.4), rgba(96, 165, 250, 0.8))"
            }}
          />
          <div
            className="neural-connection nc-2 absolute rounded-sm"
            style={{
              height: "2.5px",
              width: `${iconSize * 0.35}px`,
              top: `${iconSize * 0.15}px`,
              left: `${iconSize * 0.5}px`,
              transformOrigin: "left",
              transform: "rotate(-38deg)",
              background: "linear-gradient(90deg, rgba(59, 130, 246, 0.4), rgba(96, 165, 250, 0.8))"
            }}
          />
          <div
            className="neural-connection nc-3 absolute rounded-sm"
            style={{
              height: "2.5px",
              width: `${iconSize * 0.3}px`,
              top: `${iconSize * 0.39}px`,
              left: `${iconSize * 0.21}px`,
              transformOrigin: "left",
              transform: "rotate(50deg)",
              background: "linear-gradient(90deg, rgba(59, 130, 246, 0.4), rgba(96, 165, 250, 0.8))"
            }}
          />
          <div
            className="neural-connection nc-4 absolute rounded-sm"
            style={{
              height: "2.5px",
              width: `${iconSize * 0.3}px`,
              top: `${iconSize * 0.39}px`,
              right: `${iconSize * 0.21}px`,
              transformOrigin: "left",
              transform: "rotate(-50deg)",
              background: "linear-gradient(90deg, rgba(59, 130, 246, 0.4), rgba(96, 165, 250, 0.8))"
            }}
          />
          <div
            className="neural-connection nc-5 absolute rounded-sm"
            style={{
              height: "2.5px",
              width: `${iconSize * 0.275}px`,
              bottom: `${iconSize * 0.175}px`,
              left: `${iconSize * 0.46}px`,
              transformOrigin: "left",
              transform: "rotate(-48deg)",
              background: "linear-gradient(90deg, rgba(59, 130, 246, 0.4), rgba(96, 165, 250, 0.8))"
            }}
          />
          <div
            className="neural-connection nc-6 absolute rounded-sm"
            style={{
              height: "2.5px",
              width: `${iconSize * 0.275}px`,
              bottom: `${iconSize * 0.175}px`,
              left: `${iconSize * 0.46}px`,
              transformOrigin: "left",
              transform: "rotate(48deg)",
              background: "linear-gradient(90deg, rgba(59, 130, 246, 0.4), rgba(96, 165, 250, 0.8))"
            }}
          />

          {/* Nodes */}
          <div
            className="neural-node absolute rounded-full transition-all duration-300"
            style={{
              width: `${iconSize * 0.175}px`,
              height: `${iconSize * 0.175}px`,
              background: "#3B82F6",
              top: `${iconSize * 0.0625}px`,
              left: `${iconSize * 0.4125}px`,
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.6)"
            }}
          />
          <div
            className="neural-node absolute rounded-full transition-all duration-300"
            style={{
              width: `${iconSize * 0.15}px`,
              height: `${iconSize * 0.15}px`,
              background: "#60A5FA",
              top: `${iconSize * 0.3125}px`,
              left: `${iconSize * 0.1}px`,
              boxShadow: "0 0 10px rgba(96, 165, 250, 0.6)"
            }}
          />
          <div
            className="neural-node absolute rounded-full transition-all duration-300"
            style={{
              width: `${iconSize * 0.15}px`,
              height: `${iconSize * 0.15}px`,
              background: "#60A5FA",
              top: `${iconSize * 0.3125}px`,
              right: `${iconSize * 0.1}px`,
              boxShadow: "0 0 10px rgba(96, 165, 250, 0.6)"
            }}
          />
          <div
            className="neural-node nn-center absolute rounded-full transition-all duration-300"
            style={{
              width: `${iconSize * 0.225}px`,
              height: `${iconSize * 0.225}px`,
              background: "#F59E0B",
              top: `${iconSize * 0.5625}px`,
              left: `${iconSize * 0.3875}px`,
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.8)"
            }}
          />
          <div
            className="neural-node absolute rounded-full transition-all duration-300"
            style={{
              width: `${iconSize * 0.1375}px`,
              height: `${iconSize * 0.1375}px`,
              background: "#8B5CF6",
              bottom: `${iconSize * 0.1}px`,
              left: `${iconSize * 0.1875}px`,
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.6)"
            }}
          />
          <div
            className="neural-node absolute rounded-full transition-all duration-300"
            style={{
              width: `${iconSize * 0.1375}px`,
              height: `${iconSize * 0.1375}px`,
              background: "#8B5CF6",
              bottom: `${iconSize * 0.1}px`,
              right: `${iconSize * 0.1875}px`,
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.6)"
            }}
          />
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div>
          <div
            style={{
              fontSize: `${textSize}px`,
              fontWeight: 900,
              letterSpacing: "-1.5px",
              lineHeight: 1
            }}
          >
            <span className="text-gray-900">Task</span>
            <span
              className="bg-gradient-to-br from-blue-500 to-purple-600"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              IQ
            </span>
          </div>
          {showTagline && (
            <div
              className="text-gray-500 font-semibold mt-1.5"
              style={{
                fontSize: `${taglineSize}px`,
                letterSpacing: "1.8px"
              }}
            >
              SMART TASK MANAGEMENT
            </div>
          )}
        </div>
      )}
    </div>
  )
}
