import React, { useEffect } from "react";
import {Container} from "@mantine/core";

export default function About() {

    useEffect(() => {
        document.title = "Rotaeno Stabilizer - About";
    });

    return (
        <Container className="pagesContainer">
            <h1>关于</h1>
        </Container>
    );
}