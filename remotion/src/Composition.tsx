import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, Img, staticFile, spring } from "remotion";
import { PulseLine } from "./components/PulseLine";
import { HealthStats } from "./components/HealthStats";
import { WhatsAppBubble } from "./components/WhatsAppBubble";

export const Main: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Cinematic zoom animation
    const zoom = () => {
        return interpolate(frame, [0, fps * 3], [1, 1.15], {
            extrapolateRight: "clamp",
        });
    };

    // Logo entrance animation
    const logoEntrance = spring({
        frame,
        fps,
        config: { damping: 12 },
    });

    return (
        <AbsoluteFill style={{ backgroundColor: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
            {/* Intro Sequence: KinCare Brand Reveal */}
            <Sequence durationInFrames={fps * 2.5}>
                <AbsoluteFill style={{
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
                }}>
                    <div style={{
                        transform: `scale(${interpolate(logoEntrance, [0, 1], [0.5, 1])})`,
                        opacity: interpolate(logoEntrance, [0, 1], [0, 1]),
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "30px"
                    }}>
                        <div style={{
                            width: "240px",
                            height: "240px",
                            backgroundColor: "white",
                            borderRadius: "60px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0 40px 80px rgba(0,0,0,0.3)",
                            padding: "40px"
                        }}>
                            <Img src={staticFile("/assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <h1 style={{ fontSize: "120px", fontWeight: "900", color: "white", letterSpacing: "-4px", margin: 0 }}>
                                KinCare
                            </h1>
                            <p style={{ fontSize: "44px", color: "rgba(255,255,255,0.9)", fontWeight: "500", marginTop: "10px" }}>
                                Family Health Reimagined
                            </p>
                        </div>
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* Scene 1: Dad - Blood Pressure */}
            <Sequence from={fps * 2.5} durationInFrames={fps * 3}>
                <AbsoluteFill>
                    <Img
                        src={staticFile("/assets/dad.png")}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transform: `scale(${zoom()})`
                        }}
                    />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
                    <PulseLine color="#ef4444" />
                    <HealthStats label="Blood Pressure" value="118/78" unit="mmHg" color="#ef4444" />
                </AbsoluteFill>
            </Sequence>

            {/* Scene 2: WhatsApp Integration - THE KEY FEATURE */}
            <Sequence from={fps * 5.5} durationInFrames={fps * 3.5}>
                <AbsoluteFill style={{ backgroundColor: "#f0f2f5" }}>
                    <div style={{
                        padding: "60px",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "center"
                    }}>
                        <div style={{ marginBottom: "40px", textAlign: "center" }}>
                            <h2 style={{ fontSize: "64px", fontWeight: "800", color: "#128c7e", marginBottom: "10px" }}>
                                Log via WhatsApp
                            </h2>
                            <p style={{ fontSize: "32px", color: "#64748b" }}>
                                Frictionless tracking for everyone
                            </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <WhatsAppBubble message="Dad's BP: 120/80" delay={fps * 0.5} />
                            <WhatsAppBubble message="Logged! ✅ Trends look stable." delay={fps * 1.5} />
                        </div>
                    </div>
                    <div style={{
                        position: "absolute",
                        bottom: "100px",
                        left: "10%",
                        right: "10%",
                        backgroundColor: "rgba(18, 140, 126, 0.1)",
                        padding: "30px",
                        borderRadius: "24px",
                        border: "2px dashed #128c7e",
                        textAlign: "center"
                    }}>
                        <p style={{ fontSize: "28px", color: "#128c7e", fontWeight: "700", margin: 0 }}>
                            Emergency Alerts via WhatsApp
                        </p>
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* Scene 3: Grandma - Glucose */}
            <Sequence from={fps * 9} durationInFrames={fps * 3}>
                <AbsoluteFill>
                    <Img
                        src={staticFile("/assets/grandma.png")}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transform: `scale(${zoom()})`
                        }}
                    />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
                    <PulseLine color="#3b82f6" />
                    <HealthStats label="Glucose Level" value="92" unit="mg/dL" color="#3b82f6" />
                </AbsoluteFill>
            </Sequence>

            {/* Scene 4: Symptom Tracking */}
            <Sequence from={fps * 12} durationInFrames={fps * 3}>
                <AbsoluteFill>
                    <Img
                        src={staticFile("/assets/symptom.png")}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transform: `scale(${zoom()})`
                        }}
                    />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />
                    <PulseLine color="#8b5cf6" />
                    <HealthStats label="Symptom Logged" value="Mild Fatigue" unit="Severity: 2/5" color="#8b5cf6" />
                </AbsoluteFill>
            </Sequence>

            {/* Outro: Premium Call to Action */}
            <Sequence from={fps * 15}>
                <AbsoluteFill style={{
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "50px",
                        padding: "0 60px"
                    }}>
                        <div style={{
                            width: "200px",
                            height: "200px",
                            backgroundColor: "white",
                            borderRadius: "50px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
                            padding: "35px"
                        }}>
                            <Img src={staticFile("/assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <h2 style={{ fontSize: "84px", fontWeight: "900", color: "white", lineHeight: "1.1", letterSpacing: "-2px", margin: 0 }}>
                                KinCare
                            </h2>
                            <p style={{ fontSize: "36px", color: "rgba(255,255,255,0.7)", marginTop: "15px" }}>
                                Everything you need to care better.
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: "#4f46e5",
                            padding: "30px 80px",
                            borderRadius: "100px",
                            fontSize: "36px",
                            fontWeight: "800",
                            color: "white",
                            boxShadow: "0 20px 40px rgba(79, 70, 229, 0.4)",
                            border: "2px solid rgba(255,255,255,0.1)"
                        }}>
                            Download KinCare
                        </div>
                    </div>
                </AbsoluteFill>
            </Sequence>
        </AbsoluteFill>
    );
};
