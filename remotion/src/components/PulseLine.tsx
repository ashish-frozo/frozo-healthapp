import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const PulseLine: React.FC<{ color?: string }> = ({ color = "#3b82f6" }) => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();

    // Create a path that looks like a heart rate monitor
    const points = Array.from({ length: 20 }).map((_, i) => {
        const x = (i / 19) * width;
        const y = height / 2 + Math.sin(frame / 5 + i) * 50;
        return `${x},${y}`;
    });

    const path = `M ${points.join(" L ")}`;

    const opacity = interpolate(frame % (fps * 2), [0, fps, fps * 2], [0, 1, 0]);

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ position: "absolute", top: 0, left: 0, opacity }}
        >
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
