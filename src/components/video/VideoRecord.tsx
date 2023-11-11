import React, {useEffect, useRef, useState} from 'react';
import VideoToFramesCanvasRecordRTC from "../Recorder/VideoToFramesCanvasRecordRTC.tsx";

const VideoRecord = () => {
    return (
        <div>
            <VideoToFramesCanvasRecordRTC/>
        </div>
    );
};

export default VideoRecord;
