import { lazy } from "react";
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import App from "./App.tsx";
import {Pagination} from "@mantine/core";
import Preview from "./pages/Preview.tsx";
import "./i18n/config.ts"

export const Home = lazy(() => import('./pages/Home'));
export const NotFound = lazy(() => import('./pages/NotFound'));
export const VideoRecord = lazy(() => import('./pages/Records'));
export const About = lazy(() => import('./pages/About.tsx'));


const routesConfig = (
    <Route element={<App />}>
        <Route path="/" element={<Home />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/record" element={<VideoRecord />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
    </Route>
);


export const router = createBrowserRouter(
    createRoutesFromElements(routesConfig)
)
