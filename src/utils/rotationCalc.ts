import {Color} from "./models.ts"

/*
export function getPixelColor(frame: cv.Mat, x: number, y: number): Color {
    const data = frame.ptr(y, x);
    return {
        r: data[0],
        g: data[1],
        b: data[2],
        a: data[3]
    };
}
 */

export function computeRotation(left_color: Color, right_color: Color, center_color: Color, sample_color: Color, OffsetDegree: number = 180.0): number {
    const centerDist: number = Math.sqrt(Math.pow(center_color.r - sample_color.r, 2) + Math.pow(center_color.g - sample_color.g, 2) + Math.pow(center_color.b - sample_color.b, 2) + Math.pow(center_color.a - sample_color.a, 2))
    const leftLength: number = Math.sqrt(Math.pow(left_color.r - center_color.r, 2) + Math.pow(left_color.g - center_color.g, 2) + Math.pow(left_color.b - center_color.b, 2) + Math.pow(left_color.a - center_color.a, 2))
    const leftDist: number = Math.sqrt(Math.pow(left_color.r - sample_color.r, 2) + Math.pow(left_color.g - sample_color.g, 2) + Math.pow(left_color.b - sample_color.b, 2) + Math.pow(left_color.a - sample_color.a, 2))
    const rightDist: number = Math.sqrt(Math.pow(right_color.r - sample_color.r, 2) + Math.pow(right_color.g - sample_color.g, 2) + Math.pow(right_color.b - sample_color.b, 2) + Math.pow(right_color.a - sample_color.a, 2))
    const dir: number = leftDist < rightDist ? -1 : 1
    let angle: number
    if (leftLength == 0) {
        angle = OffsetDegree
    } else {
        angle = (centerDist - leftLength) / leftLength * 180.0 * dir + OffsetDegree
    }
    return angle
}
/*
export function sampleImage(frame: cv.Mat, x: number, y: number, width: number, height: number): Color {
    const totalColor: Color = {r: 0, g: 0, b: 0, a: 0}
    let colorCount = 0
    const halfWidth = Math.round(width / 2)
    const halfHeight = Math.round(height / 2)
    for (let ix = x - halfWidth; ix <= x + halfWidth; ix++) {
        for (let iy = y - halfHeight; iy <= y + halfHeight; iy++) {
            const getColor = getPixelColor(frame, ix, iy)
            totalColor.r += getColor.r
            totalColor.g += getColor.g
            totalColor.b += getColor.b
            totalColor.a += getColor.a
            colorCount++
        }
    }
    totalColor.r /= colorCount
    totalColor.g /= colorCount
    totalColor.b /= colorCount
    totalColor.a /= colorCount
    return totalColor
}
*/


export function sampleImageCanvas(frame: OffscreenCanvasRenderingContext2D, x: number, y: number, width: number, height: number): Color {
    const imgData = frame.getImageData(x, y, width, height)
    const pixelData = imgData.data;
    const totalColor: Color = {r: 0, g: 0, b: 0, a: 0}
    for (let i = 0; i < pixelData.length; i += 4) {
        totalColor.r += pixelData[i];
        totalColor.g += pixelData[i + 1];
        totalColor.b += pixelData[i + 2];
        totalColor.a += pixelData[i + 3];
    }
    totalColor.r /= pixelData.length / 4
    totalColor.g /= pixelData.length / 4
    totalColor.b /= pixelData.length / 4
    totalColor.a /= pixelData.length / 4
    return totalColor
}

export function findMaxDivisibleNumber(num: number, digit: number = 4): number {
    const multiplied = 10 ** digit
    const dNum = Math.floor(num * multiplied)
    for (let i = dNum; i > 0; i--) {
        if ((1 / i * multiplied * multiplied) % 1 == 0) {
            return i / multiplied
        }
    }
    return -1
}
