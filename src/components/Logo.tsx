import {Flex, Image, Badge, Text, Space, rem} from '@mantine/core'
import {useMediaQuery} from "@mantine/hooks";
import {useTranslation} from "react-i18next";

export default function Logo() {
    const small = useMediaQuery(`(max-width: ${rem(400)})`);
    const {t} = useTranslation()

    return (
        <Flex id="logo" align="center">
            <Image alt="logo" src="/rotaeno_logo.png" width={24} height={24} />
            <Space w="xs" />
            <Text fw={700} fz={18} truncate>
                Rotaeno Stabilizer
            </Text>
            <Space w="xs" />
            <Badge display={
                small ? "none" : "flex"
            }>{t("webVersion")}</Badge>
        </Flex>
    );
}