import React, {useEffect, useRef, useState} from 'react';
import {Table, Center, ColorSwatch, Card, Group, Text, FileInput, Button, Select } from "@mantine/core"
import {Color} from "../../utils/models.ts";
import {useTranslation} from "react-i18next";

const VideoDataDisplay: React.FC<{sampleColor: Color, leftColor: Color, rightColor: Color, centerColor: Color, videoUrl: string,
    angle: number, previewCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    videoRef: React.MutableRefObject<HTMLVideoElement | null>, displayVideo: boolean,
    onFileChange: (file: File | null) => void, onStart: () => any, onStop: () => any, startDisabled: boolean, stopDisabled: boolean,
    StepElement?: React.ComponentType, onCancel?: () => any, versionRef: React.MutableRefObject<string>}> = (
        {sampleColor, leftColor, rightColor, centerColor, angle, videoUrl,
            previewCanvasRef, videoRef, displayVideo,
            onFileChange, onStart, onStop, startDisabled, stopDisabled, StepElement,
            onCancel, versionRef}
) => {

    const rootDivRef = useRef<HTMLDivElement | null>(null);
    const [rootDivWidth, setRootDivWidth] = useState(window.innerWidth);
    const videoDisplayRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null)
    const [version, setVersion] = useState<string | null>("v2")
    const {t} = useTranslation()

    useEffect(() => {
        if (!displayVideo) {
            videoDisplayRef?.current?.style.setProperty("display", "none")
            // videoRef?.current?.style.setProperty("display", "none")
        }

        const rootDiv = rootDivRef.current
        if (rootDiv) setRootDivWidth(rootDiv.clientWidth)
        const handleRootDivResize = () => {
            if (rootDiv) setRootDivWidth(rootDiv.clientWidth)
        }

        if (rootDiv) {
            rootDivRef.current?.addEventListener("resize", handleRootDivResize)
        }

        const handleResize = () => {
            if (rootDiv) setRootDivWidth(rootDiv.clientWidth)
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (rootDiv) rootDiv.removeEventListener("resize", handleRootDivResize)
        };
    }, []);

    useEffect(() => {
        versionRef.current = version ? version : "v2"
    }, [version, versionRef]);

    const colorNames = ["Sample Color", "Left Color", "Right Color", "Center Color"]
    const colorNamesV2 = ["Bottom Left", "Top Left", "Bottom Right", "Top Right"]

    const rows = [sampleColor, leftColor, rightColor, centerColor].map((element, index) => (
        <tr key={`color${index}`}>
            <td>{version == "v1" ? colorNames[index] : colorNamesV2[index]}</td>
            <td>
                <ColorSwatch color={`rgba(${element.r}, ${element.g}, ${element.b}, ${element.a})`}/>
            </td>
            <td>{element.r.toFixed(2)}</td>
            <td>{element.g.toFixed(2)}</td>
            <td>{element.b.toFixed(2)}</td>
            <td>{element.a.toFixed(2)}</td>
        </tr>
    ));

    return (
        <div ref={rootDivRef}>
            {/*<input type="file" accept="video/*" onChange={onFileChange} />*/}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                    <Group position="apart">
                        <Text weight={500}>{t("Original Video")}</Text>
                    </Group>
                    <FileInput placeholder={t("clickSelectVideo")} accept="video/*" onChange={onFileChange} />
                    <Select
                        label={t("streamEncodingVersion")}
                        placeholder={t("streamEncodingVersion")}
                        defaultValue="v2"
                        onChange={setVersion}
                        disabled={!stopDisabled}
                        data={[
                            { value: 'v1', label: 'V1' },
                            { value: 'v2', label: 'V2' }
                        ]}
                    />
                 </Card.Section>
                <Card.Section ref={videoDisplayRef} withBorder inheritPadding py="xs">
                    <Center mt="sm">
                        <video ref={videoRef} controls muted={!displayVideo} style={{width: "100%", height: "100%"}}>
                            <source src={videoUrl} type="video/mp4" />
                        </video>
                    </Center>
                </Card.Section>
                {StepElement && <Card.Section withBorder inheritPadding py="xs">
                    <StepElement/>
                </Card.Section>}
                <Card.Section inheritPadding py="xs" style={{display: "flex"}}>
                    <Group style={{display: "flex"}}>
                        <Button onClick={onStart} disabled={startDisabled} size={"md"}>{t("start")}</Button>
                        {onCancel && <Button onClick={onCancel} disabled={stopDisabled} size={"md"}>{t("cancel")}</Button>}
                        <Button onClick={onStop} disabled={stopDisabled} size={"md"}>{t("stop")}</Button>
                    </Group>
                </Card.Section>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                    <Group position="apart">
                        <Text weight={500}>{t("Rotated Video")}</Text>
                    </Group>
                </Card.Section>
                <Card.Section withBorder inheritPadding py="xs">
                    <Center mt="sm">
                        <canvas ref={previewCanvasRef} width={rootDivWidth * 0.8} height={480} style={{width: `100%`}} />
                    </Center>
                </Card.Section>
                <Card.Section withBorder inheritPadding py="xs">
                    <Text weight={500}>{t("Angle")}: {angle.toFixed(2)}°</Text>
                </Card.Section>
                <Card.Section withBorder inheritPadding py="xs">
                    <Table>
                        <thead>
                        <tr>
                            <th>ColorName</th>
                            <th>Color</th>
                            <th>R</th>
                            <th>G</th>
                            <th>B</th>
                            <th>A</th>
                        </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </Table>
                </Card.Section>
            </Card>
        </div>
    );
};

export default VideoDataDisplay;
