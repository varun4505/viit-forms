"use client";
import React, { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (val: number) => void;
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverValue(isHalf ? index - 0.5 : index);
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div
      className="flex items-center justify-center gap-1 cursor-pointer w-full"
      onMouseLeave={() => setHoverValue(null)}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const isHalf = displayValue === index - 0.5;
        const isFull = displayValue >= index;

        return (
          <div
            key={index}
            className="relative p-1 transition-transform hover:scale-110"
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={() => hoverValue && onChange(hoverValue)}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              stroke="#525252"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient
                  id={`grad-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="50%" stopColor="#FACC15" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill={
                  isFull
                    ? "#FACC15"
                    : isHalf
                    ? `url(#grad-${index})`
                    : "transparent"
                }
                stroke={isFull || isHalf ? "#FACC15" : "#525252"}
              />
            </svg>
          </div>
        );
      })}
      <span className="ml-3 text-2xl font-bold text-white min-w-12">
        {displayValue}
      </span>
    </div>
  );
}
