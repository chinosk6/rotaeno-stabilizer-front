import {
    Header as MantineHeader,
    Group,
    Burger,
    ActionIcon,
    Menu,
    createStyles,
    useMantineColorScheme,
    rem, MantineTheme
} from '@mantine/core';
import Icon from "@mdi/react";
import { mdiWeatherNight, mdiWeatherSunny, mdiTranslate, mdiGithub } from "@mdi/js";
import { NAVBAR_BREAKPOINT } from "../App";
import Logo from "./Logo";
import {languages} from "../i18n/config.ts";
import {useTranslation} from "react-i18next";

const useStyles = createStyles((theme) => ({
    header: {
        position: 'fixed',
        zIndex: 100,
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
    },

    inner: {
        height: rem(56),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    navbarToggle: {
        [theme.fn.largerThan(NAVBAR_BREAKPOINT+1)]: {
            display: 'none',
        }
    },
}));

export function ActionToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const { i18n } = useTranslation();

    const themeColorSelector = (theme: MantineTheme) => ({
        backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.colors.yellow[4] : theme.colors.blue[6],
    })

    const gotoUrl = (url: string, newPage: boolean) => {
        const a = document.createElement("a")
        a.href = url
        if (newPage) a.target = "_blank"
        a.click()
        a.remove()
    }

    const setLanguage = (langId: string) => {
        i18n.changeLanguage(langId)
    }

    return (
        <Group position="center">
            <ActionIcon
                onClick={() => {gotoUrl("", true)}}
                size="lg"
                sx={themeColorSelector}
            >
                <Icon path={mdiGithub} size={1} />
            </ActionIcon>

            <Menu>
                <Menu.Target>
                    <ActionIcon
                        onClick={() => {}}
                        size="lg"
                        sx={themeColorSelector}
                    >
                        <Icon path={mdiTranslate} size={1} />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    {languages.map((language) => (
                        <Menu.Item
                            key={language.value}
                            onClick={() => {setLanguage(language.value)}}
                        >
                            {language.label}
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>
            <ActionIcon
                onClick={() => toggleColorScheme()}
                size="lg"
                sx={themeColorSelector}
            >
                <Icon path={colorScheme === 'dark' ? mdiWeatherSunny : mdiWeatherNight} size={1} />
            </ActionIcon>
        </Group>
    );
}

interface HeaderProps {
    navbarOpened: boolean;
    onNavbarToggle(): void;
}

export default function Header({ navbarOpened, onNavbarToggle }: HeaderProps) {
    const { classes } = useStyles();

    return (
        <MantineHeader height={56} className={classes.header} mb={120}>
            <div className={classes.inner}>
                <Group noWrap>
                    <Burger className={classes.navbarToggle} opened={navbarOpened} onClick={onNavbarToggle} size="sm" />
                    <Logo />
                </Group>

                <Group>
                    <ActionToggle />
                </Group>
            </div>
        </MantineHeader>
    );
}