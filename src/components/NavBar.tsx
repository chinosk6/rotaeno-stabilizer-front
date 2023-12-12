import React, {useEffect, useMemo, useState} from "react";
import { useLocation } from "react-router-dom";
import { createStyles, Divider, Navbar as MantineNavbar, rem, ScrollArea, useMantineTheme } from '@mantine/core';
import {NavbarButton} from "./NavBarButton.tsx";
import {
    mdiHomeOutline,
    mdiVideo,
    mdiVideoOutline,
    mdiInformationOutline
} from "@mdi/js";
import {NAVBAR_WIDTH} from "../App.tsx";
import {useTranslation} from "react-i18next";


const useStyles = createStyles((theme) => ({
    navbar: {
        position: 'fixed',
        zIndex: 100,
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },

    navbarHeader: {
        paddingBottom: theme.spacing.md,
        marginBottom: `calc(${theme.spacing.md} * 1.5)`,
        borderBottom: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
    },

    navbarFooter: {
        paddingTop: theme.spacing.md,
        marginTop: theme.spacing.md,
        borderTop: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
    },
}));

interface NavbarProps {
    style?: React.CSSProperties;
    onClose(): void;
}

export default function Navbar({ style, onClose }: NavbarProps) {
    const { classes } = useStyles();
    const [active, setActive] = useState('');
    const location = useLocation();
    const {t} = useTranslation()

    const navbarData = [
        { label: t("homePage"), icon: mdiHomeOutline, to: '/', enabled: true },
        { label: t("preview"), icon: mdiVideoOutline, to: '/preview', enabled: true },
        { label: t("record"), icon: mdiVideo, to: '/record', enabled: true },
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const activeNavItem = navbarData.find(item => item.to.startsWith(currentPath));

        if (activeNavItem) {
            setActive(activeNavItem.label);
        } else {
            setActive('');
        }
    }, [location.pathname, navbarData]);

    return (
        <MantineNavbar
            className={classes.navbar}
            width={{ sm: NAVBAR_WIDTH }}
            p="md"
            hiddenBreakpoint="sm"
            style={style}
        >
            <MantineNavbar.Section grow component={ScrollArea} mx="-xs" px="xs">
                {navbarData.map((item) => item.enabled &&
                    <div key={item.label}>
                        <NavbarButton {...item} active={active} onClose={onClose} />
                    </div>
                )}
            </MantineNavbar.Section>

            <MantineNavbar.Section
                className={classes.navbarFooter}
            >
                <NavbarButton label={t("about")} icon={mdiInformationOutline} to="/about" onClose={onClose} />
            </MantineNavbar.Section>
        </MantineNavbar>
    );
}