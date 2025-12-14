import React from 'react';

const AnimatedVLogo: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes gradient-wave {
          0% {
            transform: translateY(-150%);
          }
          100% {
            transform: translateY(150%);
          }
        }

        @keyframes glow-pulse {
          0% {
            filter: drop-shadow(0 0 0px rgba(0, 0, 0, 0));
          }
          15% {
            filter: drop-shadow(0 0 8px rgba(75, 13, 181, 0.2));
          }
          30% {
            filter: drop-shadow(0 0 15px rgba(75, 13, 181, 0.35));
          }
          45% {
            filter: drop-shadow(0 0 20px rgba(255, 85, 0, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(255, 230, 0, 0.45));
          }
          55% {
            filter: drop-shadow(0 0 20px rgba(255, 85, 0, 0.4));
          }
          70% {
            filter: drop-shadow(0 0 15px rgba(75, 13, 181, 0.35));
          }
          85% {
            filter: drop-shadow(0 0 8px rgba(75, 13, 181, 0.2));
          }
          100% {
            filter: drop-shadow(0 0 0px rgba(0, 0, 0, 0));
          }
        }

        .v-logo-animated {
          animation: glow-pulse 10s linear infinite;
        }

        .animated-gradient {
          animation: gradient-wave 10s linear infinite;
          opacity: 0.85;
          filter: blur(0px);
        }
      `}</style>

      <svg
        viewBox="0 0 72 55"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-auto v-logo-animated"
        style={{ height: '120px', width: 'auto' }}
      >
        <defs>
          {/* Animated gradient that moves from top to bottom */}
          <linearGradient id="heatWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="5%" stopColor="#000000" />
            <stop offset="15%" stopColor="#000000" />
            <stop offset="30%" stopColor="#4b0db5" />
            <stop offset="42%" stopColor="#EE481F" />
            <stop offset="50%" stopColor="#E4EA04" />
            <stop offset="58%" stopColor="#E4EA04" />
            <stop offset="70%" stopColor="#EE481F" />
            <stop offset="85%" stopColor="#000000" />
            <stop offset="95%" stopColor="#000000" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* Mask for the V shape */}
          <mask id="vMask">
            <rect width="72" height="55" fill="black" />
            <path
              d="M35.1375 54.8993C35.0844 55.8883 32.5205 49.348 31.3059 46.0832C30.7393 44.5589 36.4796 44.8638 38.059 44.4916C43.6789 43.1622 55.2446 38.3589 56.4097 21.2373C56.9727 12.96 47.7159 9.45769 47.7974 5.56189C47.9143 1.0616e-06 55.6802 0.127614 55.6802 0.127614L69.3741 0C71.2723 0.0460832 72.5223 1.98867 71.7857 3.73983L50.9491 53.2438C50.5277 54.2435 49.5503 54.8922 48.4667 54.8922H35.1375V54.8993Z"
              fill="white"
            />
            <path
              d="M16.1494 4.20421L37.6163 51.4359C38.3635 53.0807 37.0604 54.8993 35.1339 54.8993H24.8396C23.7559 54.8993 22.7786 54.2966 22.3572 53.375L1.23368 4.20421"
              fill="white"
            />
            <path
              d="M23.4124 53.5274L0.213799 4.07659C-0.533402 2.38215 0.769773 0.506915 2.69621 0.506915H12.9906C14.0742 0.506915 15.0516 1.12727 15.473 2.08083L37.8324 52.7582"
              fill="white"
            />
          </mask>
        </defs>

        {/* Animated gradient rectangle that shows through the mask */}
        <g mask="url(#vMask)">
          <rect 
            width="72" 
            height="300%" 
            y="-100%"
            fill="url(#heatWaveGradient)"
            className="animated-gradient"
          />
        </g>
      </svg>
    </>
  );
};

export default AnimatedVLogo;
