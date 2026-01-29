import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

export const WhatsAppBubble: React.FC<{ message: string; delay?: number }> = ({
    message,
    delay = 0
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrance = spring({
        frame: frame - delay,
        fps,
        config: { damping: 15, stiffness: 120 },
    });

    const opacity = interpolate(entrance, [0, 1], [0, 1]);
    const scale = interpolate(entrance, [0, 1], [0.85, 1]);
    const translateY = interpolate(entrance, [0, 1], [30, 0]);

    return (
        <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "24px 32px",
            borderRadius: "24px 24px 4px 24px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
            maxWidth: "85%",
            alignSelf: "flex-end",
            opacity,
            transform: `scale(${scale}) translateY(${translateY}px)`,
            marginBottom: "24px",
            position: "relative",
            border: "1px solid rgba(0,0,0,0.05)",
            fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: "#25D366",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </div>
                <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
                    WhatsApp
                </span>
            </div>
            <p style={{
                margin: 0,
                fontSize: "32px",
                color: "#1e293b",
                fontWeight: "600",
                lineHeight: "1.3"
            }}>
                {message}
            </p>
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "8px"
            }}>
                <span style={{
                    fontSize: "16px",
                    color: "#94a3b8",
                    fontWeight: "500"
                }}>
                    9:41 AM
                </span>
            </div>
        </div>
    );
};
