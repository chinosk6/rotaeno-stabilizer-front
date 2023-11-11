import {Flex, Image, Badge, Text, Space, rem} from '@mantine/core'
import {useMediaQuery} from "@mantine/hooks";
import {useTranslation} from "react-i18next";

export default function Logo() {
    const small = useMediaQuery(`(max-width: ${rem(500)})`);
    const mini = useMediaQuery(`(max-width: ${rem(410)})`);
    const min = useMediaQuery(`(max-width: ${rem(390)})`);
    const hide = useMediaQuery(`(max-width: ${rem(335)})`);
    const {t} = useTranslation()

    return (
        <Flex id="logo" align="center">
            <Image alt="logo" src="/rotaeno_logo.png" width={24} height={24} display={
                mini ? "none" : "auto"
            } />
            <Space w="xs" />
            {!hide && <Text fw={700} fz={min ? 12 : 18} truncate>
                Rotaeno Stabilizer
            </Text>}
            <Space w="xs" />
            <Badge display={
                small ? "none" : "flex"
            }>{t("webVersion")}</Badge>
        </Flex>
    );
}