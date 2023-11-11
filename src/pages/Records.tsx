import {Container} from "@mantine/core";
import VideoToFramesCanvasRecordRTC from "../components/Recorder/VideoToFramesCanvasRecordRTC.tsx";
import VideoRecord from "../components/video/VideoRecord.tsx";
import {useEffect} from "react";

export default function Records() {
    useEffect(() => {
        document.title = "Rotaeno Stabilizer - Record";
    });

    return (
        <Container className="pagesContainer">
            <VideoRecord/>
        </Container>
    );
}