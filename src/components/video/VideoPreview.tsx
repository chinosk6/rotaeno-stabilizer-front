import React, {useEffect, useRef, useState} from 'react';
import VideoToFramesCanvasPreview from "../Recorder/VideoToFramesCanvasPreview.tsx";

const VideoPreview = () => {
    return (
        <div>
            <VideoToFramesCanvasPreview/>
        </div>
    );
};

export default VideoPreview;
