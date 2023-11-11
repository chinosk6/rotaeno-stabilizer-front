import React, { useEffect } from "react";
import {Container, Text} from "@mantine/core";

export default function About() {

    useEffect(() => {
        document.title = "Rotaeno Stabilizer - About";
    });

    return (
        <Container className="pagesContainer">
            <h1>About</h1>
            <Text>Github: <a href="https://github.com/chinosk6/rotaeno-stabilizer-front" target="_blank">chinosk6/rotaeno-stabilizer-front</a></Text>
        </Container>
    );
}