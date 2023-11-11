import React, { useEffect } from "react";
import {Alert, Container, Text, Title} from "@mantine/core";
import { useTranslation } from 'react-i18next';

export default function Home() {
    const { t } = useTranslation();

    useEffect(() => {
        document.title = "Rotaeno Stabilizer";
    });

    return (
        <Container className="pagesContainer">
            <h1>{t("Rotaeno Stabilizer")}</h1>
            <Text>{t("desc")}</Text>
            <h2>{t("howToUse")}</h2>
            <Alert title={t("browserRecommend")} color={"green"} style={{marginBottom: "1em"}}>
                <Text>{t("browserRecommendPC")}</Text>
                <Text>{t("browserRecommendAndroid")}</Text>
                <Text>{t("browserRecommendIOS")}</Text>
            </Alert>
            <Text fw={700}>{t("useStep1")}</Text>
            <Text>{t("useStep2")}</Text>
            <h3>{t("preview")}</h3>
            <Text>{t("previewDesc")}</Text>
            <h3>{t("record")}</h3>
            <Text>{t("recordDesc")}</Text>
            <Alert title={t("warn")} color={"yellow"} style={{marginTop: "1em"}}>
                {t("browserWarn")}
                <Text>{t("useRecommend")} <a href="https://github.com/Lawrenceeeeeeee/python_rotaeno_stabilizer" target="_blank">{t("pythonVersion")}</a></Text>
            </Alert>
        </Container>
    );
}