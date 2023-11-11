import React, {useEffect, useRef, useState} from 'react';
import {Table, Center, ColorSwatch, Card, Group, Text, FileInput, Button, Space, Progress, Stepper} from "@mantine/core"
import {Color} from "../../utils/models.ts";
import Icon from '@mdi/react';
import { mdiPoll, mdiLibrary, mdiBookInformationVariant, mdiImageFrame, mdiSetMerge, mdiSourceMerge } from '@mdi/js';
import {useTranslation} from "react-i18next";

const VideoRecordProcress: React.FC<{step: number, schedule: number, downloadUrl: string, ffmMsg: string,
    frameTime: number[], fps: number, isError: boolean}> = (
    {step, schedule, downloadUrl, ffmMsg, frameTime, fps, isError}
) => {
    const {t} = useTranslation()

    function formatDate() {
        const date = new Date()
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const seconds = ("0" + date.getSeconds()).slice(-2);
        return year + month + day + hours + minutes + seconds;
    }

    const downloadVideo = (needDownload: boolean) => {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.target = "_blank"
        if (needDownload) link.download = `Rotaeno_rotated_${formatDate()}.webm`;
        link.click();
        link.remove();
    }

    const checkCurrentStep = (thisStep: number) => {
        return thisStep == step
    }

    const checkCurrentColor = (thisStep: number) => {
        if (checkCurrentStep(thisStep)) {
            return isError ? "red" : "blue"
        }
        return "blue"
    }

    return (
        <div>
            <Stepper active={step} breakpoint="sm" orientation="vertical">
                <Stepper.Step label={t("performanceTest")} description={t("performanceTestDesc", {avg: frameTime[0], max: frameTime[1]})} icon={<Icon path={mdiPoll} size="1.1rem"/>} color={checkCurrentColor(0)}/>
                <Stepper.Step label={t("loadLibrary")} description={t("loadLibraryDesc")} icon={<Icon path={mdiLibrary} size="1.1rem"/>} color={checkCurrentColor(1)}/>
                <Stepper.Step label={t("getVideoInfo")} description={`FPS: ${fps}`} icon={<Icon path={mdiBookInformationVariant} size="1.1rem"/>} color={checkCurrentColor(2)}/>
                <Stepper.Step label={t("processFrames")} description={t("processFramesDesc")} icon={<Icon path={mdiImageFrame} size="1.1rem"/>} color={checkCurrentColor(3)}/>
                <Stepper.Step label={t("mergeFrames")} description={t("mergeFramesDesc")} icon={<Icon path={mdiSetMerge} size="1.1rem"/>} color={checkCurrentColor(4)}/>
                <Stepper.Step label={t("mergeAudio")} description={t("mergeAudioDesc")} icon={<Icon path={mdiSourceMerge} size="1.1rem"/>} color={checkCurrentColor(5)}/>
                <Stepper.Completed>
                    <Text>{t("processDone")}</Text>
                    <Group style={{display: "flex"}}>
                        <Button onClick={() => downloadVideo(false)}>{t("preview")}</Button>
                        <Button onClick={() => downloadVideo(true)}>{t("download")}</Button>
                    </Group>
                </Stepper.Completed>
            </Stepper>
            <Group style={{paddingTop: "1em", paddingBottom: "1em"}}>
                <Text weight={500}>FFmpeg Log: </Text>
                <Text>{ffmMsg}</Text>
            </Group>
            {step < 5 && <Progress size="md" value={schedule} />}
        </div>
    );
};

export default VideoRecordProcress;
