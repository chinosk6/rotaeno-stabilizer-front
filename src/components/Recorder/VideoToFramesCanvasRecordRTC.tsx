import React, {useEffect, useRef, useState} from 'react';
import {findMaxDivisibleNumber} from "../../utils/rotationCalc.ts";
import {Color} from "../../utils/models.ts";
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import {FFmpeg} from "@ffmpeg/ffmpeg";
import RecordRTC from 'recordrtc';
import {videoProcessor} from "../../utils/videoProcess.ts";
import VideoDataDisplay from "../dataDisplay/VideoDataDisplay.tsx";
import VideoRecordProcress from "../dataDisplay/VideoRecordProcress.tsx";
// @ts-ignore
import {DownloadProgressEvent} from "@ffmpeg/util/dist/cjs/types";
import {showErrorMessage, showWarningMessage} from "../../utils/logs.ts";
import {CancelProcess} from "../../utils/Errors.ts";
import {mimeTypes} from "../../utils/types.ts";
import {useTranslation} from "react-i18next";

const VideoToFramesCanvasRecordRTC = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [rotateAngle, setRotateAngle] = useState(0);
    const [sc, setSc] = useState<Color>({r: 0, g: 0, b: 0, a: 0});
    const [lc, setLc] = useState<Color>({r: 0, g: 0, b: 0, a: 0});
    const [rc, setRc] = useState<Color>({r: 0, g: 0, b: 0, a: 0});
    const [cc, setCc] = useState<Color>({r: 0, g: 0, b: 0, a: 0});

    const [ffmLoaded, setFFmLoaded] = useState<boolean>(false);
    const [videoFps, setVideoFps] = useState(-1);
    const [isProcessing, setIsProcessing] = useState(false);
    const videoFpsRef = useRef(videoFps);
    const ffmLoadedRef = useRef(ffmLoaded);
    const gettingFpsRef = useRef(false);

    const ffmpegRef = useRef(new FFmpeg());
    const [ffmMsg, setFFmMsg] = useState("")
    let ffmLoading = false

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [currentStep, setCurrentStepState] = useState(-1);
    const [currentSchedule, setCurrentSchedule] = useState(0);
    const [finalDownloadFileUrl, setFinalDownloadFileUrl] = useState("");
    const [avgFrameTime, setAvgFrameTime] = useState([-1, -1]);
    const [isCurrentError, setCurrentError] = useState(false);
    const [forceCancel, setForceCancel] = useState(false);
    const forceCancelRef = useRef(forceCancel);
    const [cacheVideoDuration, setCacheVideoDuration] = useState(1);
    const cacheVideoDurationRef = useRef(cacheVideoDuration);
    const streamVersionRef = useRef<string>("v2")
    const {t} = useTranslation()

    const handleFileChange = (file: File | null) => {
        if (file) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file))
        }
    }

    const setCurrentStep = (num: number) => {
        setCurrentSchedule(0)
        setCurrentStepState(num)
    }

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        videoFpsRef.current = videoFps;
        ffmLoadedRef.current = ffmLoaded;
        forceCancelRef.current = forceCancel
        cacheVideoDurationRef.current = cacheVideoDuration
    }, [videoFps, ffmLoaded, forceCancel, cacheVideoDuration]);


    const loadFFmpeg = async () => {
        const handleDownloadEvent = (event: DownloadProgressEvent, index: number) => {
            let percent = event.received / event.total * 100 / 2
            if (index == 1) {
                percent += 50
            }
            setCurrentSchedule(percent)
        }

        if (ffmLoadedRef.current || ffmLoading) return
        ffmLoading = true
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm'
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            console.log(message)
            ffmMessageProcessor(message)
            setFFmMsg(message)
        });
        const result = await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript', true, (e) => {handleDownloadEvent(e, 0)}),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm', true, (e) => {handleDownloadEvent(e, 1)}),
        });
        // const result = await ffmpeg.load()
        console.log("ffmpeg load result:", result)
        ffmLoading = false
        setFFmLoaded(true)
    }

    const ffmMessageProcessor = (msg: string) => {
        if (gettingFpsRef.current) {
            const tbrMatch = msg.match(/fps,\s*([\d.]+)\s*tbr/)
            if (tbrMatch) {
                console.log("get video tbr", tbrMatch)
                setVideoFps(parseInt(tbrMatch[1], 10))
            }
        }
    }

    const checkPlaybackRate = (rate: number): number => {
        if (rate > 16.0) return 16.0
        if (rate < 0.0625) return 0.0625
        return rate
    }

    const getBestSupportedType = (): mimeTypes | null=> {
        const types: mimeTypes[] = ["video/webm;codecs=h264", "video/webm;codecs=vp9", "video/webm;codecs=vp8"]
        for (const i of types) {
            if (MediaRecorder.isTypeSupported(i)) return i
        }
        return null
    }

    const startRecordRotateVideo = async (videoSpeed: number = 1.0, fps: number = 60, mimeType: mimeTypes = "video/webm;codecs=h264", saveDuration = false, recordOnly = false, videoSrc?: string) => {
        // const videoRef = document.createElement("video");
        // const video = videoRef.current
        const video = videoRef?.current
        if (!video) return null

        video.src = videoSrc ? videoSrc : videoUrl
        // video.autoplay = true
        const newPlaybackRate = checkPlaybackRate(videoSpeed)
        video.playbackRate = newPlaybackRate
        video.muted = true
        // video.loop = true

        await new Promise((resolve) => {
            video.onloadeddata = () => {
                resolve(1)
            }
        })

        video.width = video.videoWidth
        video.height = video.videoHeight

        const outputCanvas = document.createElement("canvas")
        const previewCanvas = canvasRef.current;
        if (!previewCanvas) return null

        let stream: MediaStream;
        // @ts-ignore
        // Safari not support this API. See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream
        // const captureStreamFunc = video.captureStream
        const captureStreamFunc = undefined
        // const recordFps = fps * (recordOnly ? 1 : newPlaybackRate)
        const recordFps = fps
        if (recordOnly && captureStreamFunc) {
            // @ts-ignore
            stream = video.captureStream()
        } else {
            stream = outputCanvas.captureStream(fps);
        }
        const recorder = new RecordRTC(stream, {
            type: 'video',
            mimeType: mimeType,
            videoBitsPerSecond: 20 * 1000000,
            frameRate: recordFps,  // * newPlaybackRate,
            frameInterval: recordFps,   // * newPlaybackRate
        });

        video.addEventListener("play", () => {
            recorder.startRecording()
        })

        video.addEventListener("timeupdate", () => {
            let duration = video.duration
            if (saveDuration) {
                if (duration < Infinity) {
                    setCacheVideoDuration(duration / newPlaybackRate)
                }
            }
            else {
                if (duration == Infinity) {
                    duration = cacheVideoDurationRef.current
                }
            }
            setCurrentSchedule(video.currentTime / duration * 100)
        })

        await video.play()
        if (!recordOnly) {
            processVideo(video, previewCanvas, outputCanvas);
        }
        else {
            if (!captureStreamFunc) recordVideo(video, outputCanvas)
        }

        return await new Promise<Blob>((resolve, reject) => {
            video.addEventListener("ended", () => {
                console.log("end!")
                setCurrentSchedule(100)
                recorder.stopRecording(() => {
                    const videoBlob = recorder.getBlob()
                    if (forceCancelRef.current) {
                        setForceCancel(false)
                        reject(new CancelProcess("Cancel Process."))
                    }
                    resolve(videoBlob)
                })
            })
        })
    }

    const processVideo = (video: HTMLVideoElement, previewCanvas: HTMLCanvasElement, outputCanvas: HTMLCanvasElement | OffscreenCanvas,
                          autoLoop: boolean = true, outputVideoSize: number = 1.0) => {
        return videoProcessor(video, previewCanvas, document.location.pathname,
            (sampleColor, leftColor, rightColor, centerColor, angle) => {
            setSc(sampleColor)
            setLc(leftColor)
            setRc(rightColor)
            setCc(centerColor)
            setRotateAngle(angle)
        }, streamVersionRef.current, outputCanvas, autoLoop, outputVideoSize)
    }

    const performanceTest = async () => {
        const video = document.createElement("video")
        video.src = videoUrl
        video.muted = true

        await new Promise((resolve) => {
            video.onloadeddata = () => {
                resolve(1);
            };
        });

        video.width = video.videoWidth
        video.height = video.videoHeight

        const previewCanvas = canvasRef.current
        if (!previewCanvas) return [-1, -1]
        const outputCanvas = new OffscreenCanvas(200, 200)

        const testLoopCount = 300
        let totalTimeMs = 0
        let maxTimeMs = 0
        let currCount = 0

        await video.play()
        const process = () => {
            setCurrentSchedule(currCount / testLoopCount * 100)
            const currentTime = processVideo(video, previewCanvas, outputCanvas, false)
            console.log("currentTime", currentTime)
            totalTimeMs += currentTime
            if (currentTime > maxTimeMs) maxTimeMs = currentTime

            if (currCount < testLoopCount) {
                currCount++
                requestAnimationFrame(process)
            }
        }
        process()

        await new Promise((resolve) => {
            const checkLoop = () => {
                if (currCount >= testLoopCount) {
                    resolve(1)
                }
                else {
                    requestAnimationFrame(checkLoop)
                }
            }
            checkLoop()
        })

        // for (let i = 0; i < testLoopCount; i++) {
        //     const currentTime = await new Promise<number>((resolve) => {
        //         setCurrentSchedule((i + 1) / testLoopCount * 100)
        //         resolve(processVideo(video, previewCanvas, outputCanvas, false))
        //     })
        //     console.log("currentTime", currentTime)
        //     totalTimeMs += currentTime
        //     if (currentTime > maxTimeMs) maxTimeMs = currentTime
        // }

        video.pause()
        video.remove()
        //outputCanvas.remove()
        return [maxTimeMs, totalTimeMs / testLoopCount]
    }

    const getVideoFps = async(origSaveName: string) => {
        if (!videoFile) return -1
        gettingFpsRef.current = true
        await loadFFmpeg()
        const ffmpeg = ffmpegRef.current
        await ffmpeg.writeFile(origSaveName, await fetchFile(videoFile))
        await ffmpeg.exec(['-i', origSaveName])
        const timeout = 5000
        const ret = await new Promise<number>((resolve) => {
            let totalTime = 0
            const inner = () => {
                const currentFps = videoFpsRef.current
                if (currentFps < 0) {
                    totalTime += 100
                    if (totalTime <= timeout) {
                        setTimeout(inner, 100)
                    }
                    else {
                        resolve(-1)
                    }
                }
                else {
                    resolve(currentFps)
                }
            }
            inner()
        })
        gettingFpsRef.current = false
        return ret
    }

    const writeVideoFileToFFm = async(origSaveName: string) => {
        if (!videoFile) return -1
        await loadFFmpeg()
        const ffmpeg = ffmpegRef.current
        await ffmpeg.writeFile(origSaveName, await fetchFile(videoFile))
    }

    const getVideoFpsJs = async() => {
        const vid = document.createElement("video")
        vid.src = videoUrl
        vid.muted = true

        await new Promise((resolve) => {
            vid.onloadeddata = () => {
                resolve(1)
            }
        })
        await vid.play()

        let last_media_time: number, last_frame_num: number, fps: number = 60;
        const fps_rounder: number[] = [];
        let frame_not_seeked = true;
        const iterCount = 50

        function get_fps_average() {
            return fps_rounder.reduce((a, b) => a + b) / fps_rounder.length;
        }

        vid.addEventListener("seeked", function () {
            fps_rounder.pop();
            frame_not_seeked = false;
        });

        await new Promise<number>((resolve) => {
            function ticker(useless: number, metadata: VideoFrameCallbackMetadata) {
                const media_time_diff = Math.abs(metadata.mediaTime - last_media_time);
                const frame_num_diff = Math.abs(metadata.presentedFrames - last_frame_num);
                const diff = media_time_diff / frame_num_diff;
                if (fps_rounder.length >= iterCount) {
                    resolve(fps)
                }
                if (vid.paused || vid.ended) {
                    resolve(fps)
                }
                if (
                    diff &&
                    diff < 1 &&
                    frame_not_seeked &&
                    // fps_rounder.length < iterCount &&
                    vid.playbackRate === 1 &&
                    document.hasFocus()
                ) {
                    fps_rounder.push(diff);
                    fps = Math.round(1 / get_fps_average());
                    setCurrentSchedule(fps_rounder.length / iterCount * 100)
                }
                frame_not_seeked = true;
                last_media_time = metadata.mediaTime;
                last_frame_num = metadata.presentedFrames;
                vid.requestVideoFrameCallback(ticker);
            }

            vid.requestVideoFrameCallback(ticker);
        })
        vid.pause()
        vid.remove()
        return fps
    }

    const recordVideo = (video: HTMLVideoElement, outputCanvas: HTMLCanvasElement) => {
        const startTime = new Date()
        const width = video.videoWidth;
        const height = video.videoHeight;
        outputCanvas.width = width
        outputCanvas.height = height

        const outputContext = outputCanvas.getContext("2d")

        outputContext?.drawImage(video, 0, 0)  // 主要耗时

        const spendTime = new Date().getTime() - startTime.getTime()

        if (!video.paused) requestAnimationFrame(() => recordVideo(video, outputCanvas));
        // if (!video.paused) setTimeout(() => processVideo(video, previewCanvas, outputCanvas, autoLoop, outputVideoSize), 16.667);
        return spendTime
    }

    const restoreVideoVoice = async(videoBlob: Blob, origSaveName: string) => {
        await loadFFmpeg()
        const ffmpeg = ffmpegRef.current

        const videoName = `restored_${origSaveName.split('.')[0]}.mp4`
        const musicName = origSaveName.split(".")[0] + ".ogg"
        const outputName = `final_${videoName}`

        await ffmpeg.writeFile(videoName, await fetchFile(videoBlob))
        await ffmpeg.exec(["-i", origSaveName, "-vn", musicName])
        await ffmpeg.exec(["-i", videoName, "-i", musicName, "-c:v", "copy", "-c:a", "copy", "-shortest", outputName])
        await ffmpeg.deleteFile(videoName)
        await ffmpeg.deleteFile(origSaveName)

        console.log("音乐", URL.createObjectURL(new Blob([await ffmpeg.readFile(musicName)], {type: "audio/ogg"})))

        await ffmpeg.deleteFile(musicName)
        return await ffmpeg.readFile(outputName)
    }

    const startRotateVideo = async () => {
        try {
            setIsProcessing(true)

            if (!videoFile) return
            const videoName = videoFile.name
            const origSaveName = `inputVideo_${videoFile.name}`

            setCurrentStep(0)
            setCurrentError(false)
            const formatType = getBestSupportedType()
            if (!formatType) {
                setCurrentError(true)
                showErrorMessage(t("encoderNotSupport"))
                console.log(t("encoderNotSupport"))
                return
            }
            console.log("formatType", formatType)
            const [maxTime, avgTime] = await performanceTest()
            if (maxTime == -1) {
                setCurrentError(true)
                showErrorMessage(t("performanceTestFailed"))
                console.log(t("performanceTestFailed"))
                return
            }
            console.log(`Performance Test: max: ${maxTime}, avg: ${avgTime}`)
            setAvgFrameTime([avgTime, maxTime])

            const rotatingTimeMs = avgTime + (maxTime - avgTime) * 0.9
            setCurrentStep(1)

            await writeVideoFileToFFm(origSaveName)
            // const videoFps = await getVideoFps(origSaveName)

            setCurrentStep(2)

            let videoFps = await getVideoFpsJs()
            if (videoFps < 59) {
                const newVideoFps = await getVideoFps(origSaveName)
                if (Math.abs(newVideoFps - videoFps) >= 4) {
                    showWarningMessage(t("compatibilityWarningInfo", {fps: videoFps}), t("compatibilityWarning"), 10000)
                }
                videoFps = newVideoFps
            }
            console.log("videoFps", videoFps)
            if (videoFps < 0) {
                setCurrentError(true)
                showErrorMessage(t("getVideoInfoFailed"))
                console.log(t("getVideoInfoFailed"))
                return
            }
            setVideoFps(videoFps)
            let videoSpeed = findMaxDivisibleNumber(checkPlaybackRate(parseFloat((1000 / videoFps / rotatingTimeMs).toFixed(4))))
            if ((videoSpeed >= 1.0) && (videoSpeed <= 2.0)) videoSpeed = 1.0
            console.log("videoSpeed", videoSpeed)
            if (videoSpeed < 0.0625) {
                showWarningMessage(t("lowPerformance"))
                console.log(t("lowPerformance"))
            }

            setCurrentStep(3)

            const videoResult = await startRecordRotateVideo(videoSpeed, videoFps, formatType, true)
            if (!videoResult) {
                setCurrentError(true)
                showErrorMessage(t("recordFailed"))
                console.log(t("recordFailed"))
                return
            }
            const recordResultURL = URL.createObjectURL(videoResult)
            console.log("录制结果", recordResultURL)

            setCurrentStep(4)
            const restoredFile = videoSpeed == 1.0 ? videoResult : await startRecordRotateVideo(1 / videoSpeed, videoFps, formatType, false, true, recordResultURL)  // 还原视频速度
            // const restoredFile = await startRecordRotateVideo(1 / videoSpeed, videoFps, false, true, recordResultURL)  // 还原视频速度
            if (!restoredFile) {
                setCurrentError(true)
                showErrorMessage(t("mergeVideoFailed"))
                console.log(t("mergeVideoFailed"))
                return
            }

            try {
                console.log("还原视频完成", URL.createObjectURL(new Blob([restoredFile], { type: formatType })))
            }
            catch (e) {
                console.log(`还原视频完成, 转URL出错: ${e}`, URL.createObjectURL(new Blob([restoredFile], { type: formatType })))
            }

            setCurrentStep(5)
            let finalFileURL: string
            try {
                const finalFileData = await restoreVideoVoice(restoredFile, origSaveName)
                finalFileURL = URL.createObjectURL(new Blob([finalFileData], { type: formatType }))
            }
            catch (e) {
                showWarningMessage("no audio", "Video Warning", 5000)
                finalFileURL = URL.createObjectURL(restoredFile)
            }

            setCurrentSchedule(100)

            setFinalDownloadFileUrl(finalFileURL)
            setCurrentStep(6)
            console.log("处理完成", finalFileURL)
        }
        catch (e) {
            if (e instanceof CancelProcess) {
                console.log("用户取消了操作")
                setCurrentStep(-1)
            }
            else {
                setCurrentError(true)
                showErrorMessage(t("unexpectedException", {"e": e}))
            }
        }
        finally {
            setIsProcessing(false)
        }
    }

    const stopPlay = () => {
        const video = videoRef.current
        if (!video) return
        // video.pause()
        // video.currentTime = 0
        // video.dispatchEvent(new Event('ended'))
        video.currentTime = video.duration
    }

    const cancelProcess = () => {
        setForceCancel(true)
        stopPlay()
    }

    const isVideoPause = () => {
        const video = videoRef.current
        if (!video) return true
        return video.paused
    }

    const StepElement: React.FC = () => (
        <VideoRecordProcress step={currentStep} schedule={currentSchedule} downloadUrl={finalDownloadFileUrl}
                             ffmMsg={ffmMsg} fps={videoFps} frameTime={avgFrameTime} isError={isCurrentError}/>
    )

    return (
        <VideoDataDisplay videoRef={videoRef} videoUrl={videoUrl} previewCanvasRef={canvasRef} leftColor={lc}
                          sampleColor={sc} rightColor={rc} centerColor={cc} angle={rotateAngle} displayVideo={false}
                          onFileChange={handleFileChange} onStart={startRotateVideo} onStop={stopPlay} onCancel={cancelProcess}
                          startDisabled={!videoFile || isProcessing} stopDisabled={isVideoPause()} StepElement={StepElement} versionRef={streamVersionRef}/>
    );
};

export default VideoToFramesCanvasRecordRTC;
