import {Container} from "@mantine/core";
import VideoPreview from "../components/video/VideoPreview.tsx";
import {useEffect} from "react";

export default function Preview() {

    useEffect(() => {
        document.title = "Rotaeno Stabilizer - Preview";
    });

    return (
        <Container className="pagesContainer">
            <VideoPreview/>
        </Container>
    );
}