import React from "react";
import AdminLayout from "./AdminLayout";
import GuestLayout from "./GuestLayout";
import { usePage } from "@inertiajs/react";

export default function RouteLayout({ App, props }: { App: any; props: any }) {
    const user = props.initialPage.props.auth?.user;

    const Layout: any = user ? AdminLayout : GuestLayout;

    return (
        <Layout user={user}>
            <App {...props} />
        </Layout>
    );
}
