import React from "react";
import { Composition } from "remotion";
import { Main } from "./Composition";
import { MagicChat } from "./MagicChat";

console.log("Remotion Root is mounting...");

export const RemotionRoot: React.FC = () => {
    try {
        return (
            <>
                <Composition
                    id="Main"
                    component={Main}
                    durationInFrames={555} // 18.5 seconds at 30fps
                    fps={30}
                    width={1080}
                    height={1920}
                />
                <Composition
                    id="MagicChat"
                    component={MagicChat}
                    durationInFrames={300} // 10 seconds at 30fps
                    fps={30}
                    width={1080}
                    height={1920}
                />
            </>
        );
    } catch (err) {
        console.error("Error in RemotionRoot:", err);
        return null;
    }
};
