import React, {useEffect, useRef, useState} from 'react';
import {Color} from "../../utils/models.ts";
import {FFmpeg} from "@ffmpeg/ffmpeg";
import {videoProcessor} from "../../utils/videoProcess.ts";
import VideoDataDisplay from "../dataDisplay/VideoDataDisplay.tsx";
import {useLocation} from "react-router-dom";

const VideoToFramesCanvasPreview = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [rotateAngle, setRotateAngle] = useState(0);
    const [sc, setSc] = useState<Color>({r: 0, g: 0, b: 0, a: 0});
    const [lc, setLc] = useState<Color>({r: 0, g: 0, b: 0, a: 0});
    const [rc, setRc] = useState<Color>({r: 0, g: 0, b: 0, a: 0});
    const [cc, setCc] = useState<Color>({r: 0, g: 0, b: 0, a: 0});
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>("");

    const handleFileChange = (file: File | null) => {
        if (file) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file))
        }
    }

    const startRecordRotateVideo = async (videoSrc?: string) => {
        // const videoRef = document.createElement("video");
        // const video = videoRef.current
        const video = videoRef?.current
        if (!video) return null

        video.src = videoSrc ? videoSrc : videoUrl

        await new Promise((resolve) => {
            video.onloadeddata = () => {
                resolve(1)
            }
        })

        // video.width = video.videoWidth
        // video.height = video.videoHeight

        const previewCanvas = canvasRef.current;
        if (!previewCanvas) return null


        await video.play()
        processVideo(video, previewCanvas);

        return await new Promise((resolve) => {
            video.addEventListener("ended", () => {
                console.log("end!")
                resolve(1)
            })
        })
    }

    const processVideo = (video: HTMLVideoElement, previewCanvas: HTMLCanvasElement) => {
        return videoProcessor(video, previewCanvas, document.location.pathname,
            (sampleColor, leftColor, rightColor, centerColor, angle) => {
                setSc(sampleColor)
                setLc(leftColor)
                setRc(rightColor)
                setCc(centerColor)
                setRotateAngle(angle)
            })
    }

    const startRotateVideo = async () => {
        if (!videoFile) return
        if (!isVideoEnded()) await stopPlayA()
        await startRecordRotateVideo()
        console.log("处理完成")
    }

    const stopPlay = () => {
        const video = videoRef.current
        if (!video) return
        //video.pause()
        video.currentTime = video.duration
        //video.dispatchEvent(new Event('ended'))
    }

    const stopPlayA = async () => {
        const video = videoRef.current
        if (!video) return
        stopPlay()
        await new Promise((resolve) => {
            video.onended = () => {
                resolve(1)
            }
        })
    }

    const isVideoEnded = () => {
        const video = videoRef.current
        if (!video) return true
        if (!video.src) return true
        return video.ended
    }

    return (
        <VideoDataDisplay videoRef={videoRef} videoUrl={videoUrl} previewCanvasRef={canvasRef} leftColor={lc}
                          sampleColor={sc} rightColor={rc} centerColor={cc} angle={rotateAngle} displayVideo={true}
                          onFileChange={handleFileChange} onStart={startRotateVideo} onStop={stopPlay}
                          startDisabled={!videoFile} stopDisabled={isVideoEnded()}/>
    );
};

export default VideoToFramesCanvasPreview;
