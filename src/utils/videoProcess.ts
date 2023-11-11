import {computeRotation, sampleImageCanvas} from "./rotationCalc.ts";
import {Color} from "./models.ts";

type SetDataCallback = (sampleColor: Color, leftColor: Color, rightColor: Color, centerColor: Color, angle: number) => void


function rotateCanvas(canvas: HTMLCanvasElement | OffscreenCanvas, context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, angle: number,
                      origVideoCanvas: OffscreenCanvas) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(angle * Math.PI / 180);
    context.drawImage(origVideoCanvas, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    context.restore();
}

function getSampleColor(origContext: OffscreenCanvasRenderingContext2D, outputVideoSize: number = 1.0) {
    const width = origContext.canvas.width
    const height = origContext.canvas.height
    const O = 5 * outputVideoSize
    const S = 3 * outputVideoSize
    const sampleColor = sampleImageCanvas(origContext, O, height - O, S, S);
    const leftColor = sampleImageCanvas(origContext, O, O, S, S);
    const rightColor = sampleImageCanvas(origContext, width - O, height - O, S, S);
    const centerColor = sampleImageCanvas(origContext, width - O, O, S, S);
    return [sampleColor, leftColor, rightColor, centerColor]
}

export function videoProcessor (video: HTMLVideoElement, previewCanvas: HTMLCanvasElement, locationPathName?: string,
                                setDataCallback?: SetDataCallback,
                                outputCanvas?: HTMLCanvasElement | OffscreenCanvas, autoLoop: boolean = true,
                                outputVideoSize: number = 1.0) {
    const startTime = new Date()
    const width = video.videoWidth * outputVideoSize;
    const height = video.videoHeight * outputVideoSize;

    const previewRenderWidth = Math.max(previewCanvas.offsetWidth, 800)
    previewCanvas.height = height / width * previewRenderWidth
    previewCanvas.width = previewRenderWidth

    const origVideoCanvas = new OffscreenCanvas(width, height)

    const previewContext = previewCanvas.getContext("2d")
    const origContext = origVideoCanvas.getContext("2d", {willReadFrequently: true})
    if (!previewContext || !origContext) return 59.99

    origContext.drawImage(video, 0, 0)  // 主要耗时

    const [sampleColor, leftColor, rightColor, centerColor] = getSampleColor(origContext)
    const angle = computeRotation(leftColor, rightColor, centerColor, sampleColor)

    if (setDataCallback) setDataCallback(sampleColor, leftColor, rightColor, centerColor, angle)

    if (outputCanvas) {
        outputCanvas.width = width
        outputCanvas.height = height
        if (width != 0 && height != 0) {
            const outputContext = outputCanvas.getContext("2d")
            if (outputContext) rotateCanvas(outputCanvas, outputContext, angle, origVideoCanvas)
            previewContext.drawImage(outputCanvas, 0, 0, previewCanvas.width, previewCanvas.height)
        }
    }
    else {
        rotateCanvas(previewCanvas, previewContext, angle, origVideoCanvas)
    }

    const spendTime = new Date().getTime() - startTime.getTime()

    if (autoLoop && !video.ended) {
        if (locationPathName) {
            if (locationPathName != document.location.pathname) return spendTime
        }
        requestAnimationFrame(() => videoProcessor(video, previewCanvas, locationPathName, setDataCallback, outputCanvas, autoLoop, outputVideoSize))
    }
    return spendTime
}
