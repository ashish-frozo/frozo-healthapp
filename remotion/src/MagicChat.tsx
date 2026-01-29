import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, Img, staticFile, spring } from "remotion";
import { WhatsAppBubble } from "./components/WhatsAppBubble";
import { Activity, CheckCircle, ShieldCheck, Sparkles } from "lucide-react";

export const MagicChat: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Transformation timing
    const transformStart = fps * 4;
    const transformDuration = fps * 1.5;

    const transformProgress = spring({
        frame: frame - transformStart,
        fps,
        config: { damping: 18, stiffness: 120 },
    });

    // Background zoom
    const bgZoom = interpolate(frame, [0, fps * 10], [1, 1.05]);

    return (
        <AbsoluteFill style={{ backgroundColor: "#020617", overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif" }}>
            {/* Premium Background */}
            <Img
                src={staticFile("/assets/magic_bg_v2.png")}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${bgZoom})`,
                    opacity: 0.8
                }}
            />

            {/* Subtle Glow Overlay */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 70%)",
                pointerEvents: "none"
            }} />

            {/* Chat Sequence */}
            <Sequence durationInFrames={transformStart + transformDuration}>
                <AbsoluteFill style={{
                    padding: "80px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    opacity: interpolate(transformProgress, [0, 0.4], [1, 0])
                }}>
                    <div style={{ marginBottom: "60px", textAlign: "center" }}>
                        <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "12px",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            padding: "12px 24px",
                            borderRadius: "100px",
                            backdropFilter: "blur(10px)",
                            marginBottom: "24px",
                            border: "1px solid rgba(255,255,255,0.1)"
                        }}>
                            <Sparkles size={24} color="#818cf8" />
                            <span style={{ color: "white", fontSize: "20px", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" }}>
                                AI Powered
                            </span>
                        </div>
                        <h2 style={{ fontSize: "96px", fontWeight: "900", color: "white", marginBottom: "10px", letterSpacing: "-4px", lineHeight: "1" }}>
                            Magic Chat
                        </h2>
                        <p style={{ fontSize: "36px", color: "rgba(255,255,255,0.5)", fontWeight: "500" }}>
                            Frictionless Family Health
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <WhatsAppBubble message="Mom's Glucose: 95 mg/dL" delay={fps * 0.8} />
                        <WhatsAppBubble message="Analyzing trends..." delay={fps * 2.2} />
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* Transformation: Chat Bubble Morphs into Health Card */}
            <Sequence from={transformStart}>
                <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
                    <div style={{
                        width: interpolate(transformProgress, [0, 1], [450, 920]),
                        height: interpolate(transformProgress, [0, 1], [120, 520]),
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(30px)",
                        WebkitBackdropFilter: "blur(30px)",
                        borderRadius: "48px",
                        opacity: transformProgress,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: "60px",
                        boxShadow: "0 50px 100px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.4)",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        {/* Shimmer Effect */}
                        <div style={{
                            position: "absolute",
                            top: 0,
                            left: "-100%",
                            width: "200%",
                            height: "100%",
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                            transform: `translateX(${interpolate(frame % (fps * 3), [0, fps * 3], [0, 100])}%)`,
                            pointerEvents: "none"
                        }} />

                        {transformProgress > 0.7 && (
                            <div style={{ opacity: interpolate(transformProgress, [0.7, 1], [0, 1]) }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ backgroundColor: "#818cf8", padding: "10px", borderRadius: "12px" }}>
                                            <Activity color="white" size={28} />
                                        </div>
                                        <span style={{ fontSize: "28px", color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                                            Health Insight
                                        </span>
                                    </div>
                                    <ShieldCheck color="#10b981" size={32} />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                                        <span style={{ fontSize: "110px", fontWeight: "900", color: "#0f172a", letterSpacing: "-4px", lineHeight: "1" }}>
                                            Stable
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <CheckCircle size={24} color="#10b981" />
                                        <span style={{ fontSize: "36px", color: "#10b981", fontWeight: "700" }}>
                                            Optimal Range
                                        </span>
                                    </div>
                                </div>

                                <div style={{
                                    height: "2px",
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                    margin: "40px 0"
                                }} />

                                <p style={{ fontSize: "30px", color: "#475569", lineHeight: "1.5", fontWeight: "500" }}>
                                    Glucose levels have been consistent for the last 7 days. <span style={{ color: "#4f46e5", fontWeight: "700" }}>No action required.</span>
                                </p>
                            </div>
                        )}
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* Outro */}
            <Sequence from={fps * 7.5}>
                <AbsoluteFill style={{
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
                    opacity: interpolate(frame, [fps * 7.5, fps * 8], [0, 1])
                }}>
                    <div style={{ textAlign: "center", color: "white" }}>
                        <div style={{
                            width: "220px",
                            height: "220px",
                            backgroundColor: "white",
                            borderRadius: "55px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "0 auto 50px",
                            padding: "40px",
                            boxShadow: "0 40px 80px rgba(0,0,0,0.4)"
                        }}>
                            <Img src={staticFile("/assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <h1 style={{ fontSize: "120px", fontWeight: "900", letterSpacing: "-4px", margin: 0 }}>KinCare</h1>
                        <p style={{ fontSize: "44px", opacity: 0.9, fontWeight: "500", marginTop: "10px" }}>Intelligence for your family.</p>

                        <div style={{
                            marginTop: "80px",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            padding: "24px 60px",
                            borderRadius: "100px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            fontSize: "32px",
                            fontWeight: "700"
                        }}>
                            Download Now
                        </div>
                    </div>
                </AbsoluteFill>
            </Sequence>
        </AbsoluteFill>
    );
};
