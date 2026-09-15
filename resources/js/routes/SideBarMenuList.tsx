import {
    BankFilled,
    DashboardOutlined,
    FileImageOutlined,
    FileTextOutlined,
    FlagOutlined,
    HomeOutlined,
    IdcardOutlined,
    NotificationOutlined,
    PercentageOutlined,
    ReadOutlined,
    SettingOutlined,
    ShopOutlined,
    UserAddOutlined,
    UsergroupAddOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Link } from "@inertiajs/react";
import { RouteList } from "./RouteList";

export const SideBarMenuList = [
    {
        key: RouteList.dashboard(),
        label: <Link href={RouteList.dashboard()}>Dashboard</Link>,
        icon: <DashboardOutlined />,
        // permission: "view-dashboard",
        permission: "",
    },
    {
        key: "postsGroup",
        label: "Posts",
        icon: <FileTextOutlined />,
        permission: "index-post",
        children: [
            {
                key: RouteList.posts(),
                label: <Link href={RouteList.posts()}>All Posts</Link>,
                permission: "index-post",
            },
            {
                key: RouteList.createPost(),
                label: <Link href={RouteList.createPost()}>Create Post</Link>,
                permission: "store-post",
            },
            {
                key: RouteList.postCategories(),
                label: (
                    <Link href={RouteList.postCategories()}>
                        All Categories
                    </Link>
                ),
                permission: "index-category",
            },
            {
                key: RouteList.createPostCategory(),
                label: (
                    <Link href={RouteList.createPostCategory()}>
                        Create Category
                    </Link>
                ),
                permission: "store-category",
            },
        ],
    },
    {
        key: "eshopGroup",
        label: "E-shop Management",
        icon: <HomeOutlined />,
        permission: "index-eshop",
        children: [
            // {
            //     key: RouteList.eshopOrders(),
            //     label: <Link href={RouteList.eshopOrders()}>All Orders</Link>,
            //     permission: "index-eshop-order",
            // },

            {
                key: RouteList.eshopProducts(),
                label: (
                    <Link href={RouteList.eshopProducts()}>All Products</Link>
                ),
                permission: "store-eshop-product",
            },
            {
                key: RouteList.eshopCategories(),
                label: (
                    <Link href={RouteList.eshopCategories()}>Categories</Link>
                ),
                permission: "index-eshop-category",
            },
            {
                key: RouteList.eshopTags(),
                label: <Link href={RouteList.eshopTags()}>Tags</Link>,
                permission: "index-eshop-tag",
            },
            {
                key: RouteList.eshopAttributes(),
                label: (
                    <Link href={RouteList.eshopAttributes()}>Attributes</Link>
                ),
                permission: "",
            },
        ],
    },
    {
        key: "storesGroup",
        label: "Store Management",
        icon: <ShopOutlined />,
        permission: "index-store",
        children: [
            {
                key: RouteList.stores(),
                label: <Link href={RouteList.stores()}>All Stores</Link>,
                permission: "index-store",
            },
            {
                key: RouteList.orders(),
                label: <Link href={RouteList.orders()}>Orders</Link>,
                permission: "",
            },
            {
                key: RouteList.appointments(),
                label: (
                    <Link href={RouteList.appointments()}>Appointments</Link>
                ),
                permission: "index-appointment",
            },
            {
                key: RouteList.holidays(),
                label: <Link href={RouteList.holidays()}>Holidays</Link>,
                permission: "index-holiday",
            },
        ],
    },
    {
        key: "clientsGroup",
        label: "Clients",
        icon: <UsergroupAddOutlined />,
        permission: "index-client",
        children: [
            {
                key: RouteList.clients(),
                label: <Link href={RouteList.clients()}>All Clients</Link>,
                permission: "index-client",
            },
            {
                key: RouteList.createClients(),
                label: (
                    <Link href={RouteList.createClients()}>Create Client</Link>
                ),
                permission: "create-client",
            },
        ],
    },
    {
        key: RouteList.uploads(),
        label: <Link href={RouteList.uploads()}>Uploads Files</Link>,
        icon: <FileImageOutlined />,
        permission: "",
    },
    {
        key: "usersGroup",
        label: "Users",
        icon: <UserAddOutlined />,
        permission: "index-user",
        children: [
            {
                key: RouteList.users(),
                label: <Link href={RouteList.users()}>All Users</Link>,
                permission: "index-user",
            },
            {
                key: RouteList.createUser(),
                label: <Link href={RouteList.createUser()}>Create User</Link>,
                permission: "store-user",
            },
            {
                key: RouteList.subscriptions(),
                label: (
                    <Link href={RouteList.subscriptions()}>
                        Subscribed Users
                    </Link>
                ),
                permission: "index-user", // Using same permission as users for now
            },
            {
                key: RouteList.roles(),
                label: <Link href={RouteList.roles()}>All Roles</Link>,
                permission: "index-rule",
            },
            {
                key: RouteList.createRole(),
                label: <Link href={RouteList.createRole()}>Create Role</Link>,
                permission: "store-rule",
            },
        ],
    },
    {
        key: "pagesGroup",
        label: "Content",
        icon: <ReadOutlined />,
        permission: "index-content",
        children: [
            {
                key: RouteList.pages(),
                label: <Link href={RouteList.pages()}>All Pages</Link>,
                permission: "index-page",
            },
            {
                key: RouteList.createPage(),
                label: <Link href={RouteList.createPage()}>Create Page</Link>,
                permission: "store-page",
            },
            {
                key: RouteList.blockContents(),
                label: (
                    <Link href={RouteList.blockContents()}>Block Contents</Link>
                ),
                permission: "index-block-content",
            },
            {
                key: RouteList.createBlockContent(),
                label: (
                    <Link href={RouteList.createBlockContent()}>
                        Create Block Content
                    </Link>
                ),
                permission: "store-block-content",
            },
        ],
    },
    {
        key: "promoCode",
        label: "Promo Codes",
        icon: <PercentageOutlined />,
        permission: "view-promo-code",
        children: [
            {
                key: RouteList.promoCodes(),
                label: <Link href={RouteList.promoCodes()}>Promo Codes</Link>,
                permission: "view-promo-code",
            },
            {
                key: RouteList.createPromoCodes(),
                label: (
                    <Link href={RouteList.createPromoCodes()}>
                        Create Promo
                    </Link>
                ),
                permission: "create-promo-code",
            },
        ],
    },
    {
        key: "setting",
        label: "Setting",
        icon: <SettingOutlined />,
        permission: "view-setting",
        children: [
            {
                key: RouteList.languages(),
                label: <Link href={RouteList.languages()}>Languages</Link>,
                permission: "view-language",
            },
            {
                key: RouteList.integrations(),
                label: (
                    <Link href={RouteList.integrations()}>Integrations</Link>
                ),
                permission: "view-integration",
            },
            {
                key: RouteList.emails(),
                label: <Link href={RouteList.emails()}>Emails</Link>,
                permission: "view-email",
            },
            {
                key: "emailTemplates",
                label: (
                    <Link href={RouteList.languages()}>Email Templates</Link>
                ),
                permission: "view-email-template",
            },
            {
                key: "contacts",
                label: <Link href={RouteList.languages()}>Contacts</Link>,
                permission: "view-contacts",
            },
        ],
    },
    {
        key: RouteList.profile(),
        label: <Link href={RouteList.profile()}>Profile</Link>,
        icon: <UserOutlined />,
        permission: "view-profile",
    },
];
