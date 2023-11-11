import React, {useEffect, useRef, useState} from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import {fetchFile, toBlobURL} from '@ffmpeg/util';

interface Color {r: number, g: number, b: number, a: number}

const VideoRotateFFm = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [ffmLoaded, setFFmLoaded] = useState<boolean>(false);
    const [videoFps, setVideoFps] = useState(-1);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ffmpegRef = useRef(new FFmpeg());
    const messageRef = useRef<HTMLParagraphElement>(null);

    let ffmLoading = false

    useEffect(() => {
        // loadFFmpeg()
    }, []);

    const loadFFmpeg = async () => {
        if (ffmLoaded || ffmLoading) return
        ffmLoading = true
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm'
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            // console.log(message)
            ffmMessageProcessor(message)
            if(messageRef.current) messageRef.current.innerHTML = message;
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        const result = await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        // const result = await ffmpeg.load()
        console.log("ffmpeg load result:", result)
        ffmLoading = false
        setFFmLoaded(true)
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setVideoFile(event.target.files[0]);
            setVideoUrl(URL.createObjectURL(event.target.files[0]))
        }
    };

    const ffmMessageProcessor = (msg: string) => {
        const tbrMatch = msg.match(/fps,\s*([\d.]+)\s*tbr/)
        if (tbrMatch) {
            console.log("get video tbr", tbrMatch)
            setVideoFps(parseInt(tbrMatch[1], 10))
        }
    }

    const convertToFrames = async () => {
        if (!videoFile) return
        const origSaveName = `inputVideo_${videoFile.name}`
        const saveImgDirName = videoFile.name.split(".")[0]

        setVideoFps(-1)

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile(origSaveName, await fetchFile(videoFile));
        await ffmpeg.exec(['-i', origSaveName]);
        // const data = await ffmpeg.readFile('output.mp4');
        if (videoFps < 0) {
            console.log("获取视频信息失败")
            return
        }
        // await ffmpeg.exec(["-i", origSaveName, "-r", videoFps.toString(), "-f", "image2", "image-%8d.png"])
        await ffmpeg.createDir(saveImgDirName)
        await ffmpeg.exec(["-i", origSaveName, "-f", "image2", `${saveImgDirName}/image-%8d.png`])
        const files = await ffmpeg.listDir(saveImgDirName)
        console.log("files", files)


    }

    return (
    <div>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        {/*<video ref={videoRef} height={200} width={200} controls>*/}
        {/*    <source src={videoUrl} type="video/mp4" />*/}
        {/*</video>*/}
        <canvas ref={canvasRef} width={640} height={480} />
        <p ref={messageRef}>INFO</p>
        <button onClick={convertToFrames} disabled={!videoFile}>Test</button>
        <button onClick={loadFFmpeg} disabled={ffmLoaded}>LoadFFm</button>
    </div>
);
};

export default VideoRotateFFm;