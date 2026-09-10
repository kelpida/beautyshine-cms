import "./bootstrap";
import "antd/dist/reset.css"; // Ant Design styles
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import "../css/app.css";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            [`./Pages/${name}.tsx`, `./Pages/${name}.jsx`],
            import.meta.glob("./Pages/**/*.{jsx,tsx}")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const Page = <App {...props} />;
        const Layout = (App as any).layout || ((page: any) => page);

        root.render(Layout(Page));
    },
    progress: {
        color: "#4B5563",
    },
});
