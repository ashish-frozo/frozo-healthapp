import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

interface HealthStatsProps {
    label: string;
    value: string;
    unit: string;
    color?: string;
}

export const HealthStats: React.FC<HealthStatsProps> = ({
    label,
    value,
    unit,
    color = "#6366f1",
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrance = spring({
        frame,
        fps,
        config: {
            damping: 15,
            stiffness: 100,
        },
    });

    const scale = interpolate(entrance, [0, 1], [0.9, 1]);
    const opacity = interpolate(entrance, [0, 1], [0, 1]);
    const translateY = interpolate(entrance, [0, 1], [40, 0]);

    return (
        <div
            style={{
                position: "absolute",
                bottom: 180,
                left: "8%",
                right: "8%",
                backgroundColor: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                padding: "40px",
                borderRadius: "32px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                transform: `scale(${scale}) translateY(${translateY}px)`,
                opacity,
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            <span style={{
                fontSize: "28px",
                color: "#475569",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px"
            }}>
                {label}
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <span style={{
                    fontSize: "84px",
                    fontWeight: "800",
                    color: "#1e293b",
                    letterSpacing: "-2px"
                }}>
                    {value}
                </span>
                <span style={{
                    fontSize: "32px",
                    color: "#64748b",
                    fontWeight: "500"
                }}>
                    {unit}
                </span>
            </div>
            <div style={{
                height: "6px",
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.05)",
                borderRadius: "3px",
                marginTop: "10px",
                overflow: "hidden"
            }}>
                <div style={{
                    height: "100%",
                    width: `${interpolate(entrance, [0, 1], [0, 100])}%`,
                    backgroundColor: color,
                    borderRadius: "3px"
                }} />
            </div>
        </div>
    );
};
