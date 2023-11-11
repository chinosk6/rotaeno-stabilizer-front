import React, { useEffect } from "react";
import {Container} from "@mantine/core";

export default function NotFound() {

    useEffect(() => {
        document.title = "404 Not Found";
    });

    return (
        <Container className="pagesContainer">
            <h1>啊嘞</h1>
        </Container>
    );
}