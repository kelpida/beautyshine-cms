export const RouteList: Record<string, any> = {
    dashboard: () => "/dashboard",

    // post
    posts: () => "/posts",
    createPost: () => "/posts/create",
    editPost: (id: string | number) => `/posts/${id}`,
    // post category
    postCategories: () => "/post-categories",
    createPostCategory: () => "/post-categories/create",
    editPostCategory: (id: string | number) => `/post-categories/${id}`,
    // profile
    profile: () => "/profile",
    // roles
    roles: () => "/roles",
    createRole: () => "/roles/create",
    editRole: (id: string | number) => `/roles/${id}`,
    // users
    users: () => "/users",
    patients: () => "/patients",
    createUser: () => "/users/create",
    editUser: (id: string | number) => `/users/${id}`,
    // subscriptions
    subscriptions: () => "/subscriptions",
    subscriptionExport: () => "/subscriptions/export",
    deleteSubscription: (id: string | number) => `/subscriptions/${id}`,
    // uploads
    uploads: () => "/uploads",
    // languages
    languages: () => "/languages",
    createLanguage: () => "/languages/create",
    editLanguage: (id: string | number) => `/languages/${id}`,
    // emails
    emails: () => "/emails",
    createEmail: () => "/emails/create",
    editEmail: (id: string | number) => `/emails/${id}`,
    // pages
    pages: () => "/pages",
    createPage: () => "/pages/create",
    editPage: (id: string | number) => `/pages/${id}`,

    // block contents
    blockContents: () => "/block-contents",
    createBlockContent: () => "/block-contents/create",
    editBlockContent: (id: string | number) => `/block-contents/${id}`,

    // integrations
    integrations: () => "/integrations",
    createIntegration: () => "/integrations/create",
    editIntegration: (id: string | number) => `/integrations/${id}`,

    // promo codes
    promoCodes: () => "/promo-codes",
    createPromoCodes: () => "/promo-codes/create",
    editPromoCodes: (id: string | number) => `/promo-codes/${id}`,
    deletePromoCodes: (id: string | number) => `/promo-codes/${id}`,

    // clients
    clients: () => "/clients",
    createClients: () => "/clients/create",
    editCleint: (id: string | number) => `/clients/${id}`,
    deleteCleint: (id: string | number) => `/clients/${id}`,

    // store
    stores: () => "/stores",
    // createClients: () => "/clients/create",
    editStore: (id: string | number) => `/stores/${id}`,
    deleteStore: (id: string | number) => `/stores/${id}`,

    // holidays
    holidays: () => "/holidays",
    createHolidays: () => "/holidays/create",
    editHoliday: (id: string | number) => `/holidays/${id}`,
    deleteHoliday: (id: string | number) => `/holidays/${id}`,

    // appointments
    orderCalendar: () => "/order-calendar",
    createOrderCalendar: () => "/order-calendar/create",
    editOrderCalendar: (id: string | number) => `/order-calendar/${id}`,
    deleteOrderCalendar: (id: string | number) => `/order-calendar/${id}`,

    // orders
    orders: () => "/orders",
    createOrder: () => "/orders/create",

    // eshop categories
    eshopCategories: () => "/eshop-categories",
    createEshopCategory: () => "/eshop-categories/create",
    editEshopCategory: (id: string | number) => `/eshop-categories/${id}/edit`,
    deleteEshopCategory: (id: string | number) => `/eshop-categories/${id}`,

    // eshop tags
    eshopTags: () => "/eshop-tags",
    createEshopTag: () => "/eshop-tags/create",
    editEshopTag: (id: string | number) => `/eshop-tags/${id}/edit`,
    deleteEshopTag: (id: string | number) => `/eshop-tags/${id}`,

    // eshop attributes
    eshopAttributes: () => "/eshop-attributes",
    createEshopAttribute: () => "/eshop-attributes/create",
    editEshopAttribute: (id: string | number) => `/eshop-attributes/${id}/edit`,
    updateEshopAttribute: (id: string | number) => `/eshop-attributes/${id}`,
    deleteEshopAttribute: (id: string | number) => `/eshop-attributes/${id}`,

    // eshop products
    eshopProducts: () => "/eshop-products",
    createEshopProduct: () => "/eshop-products/create",
    editEshopProduct: (id: string | number) => `/eshop-products/${id}/edit`,
    updateEshopProduct: (id: string | number) => `/eshop-products/${id}`,
    deleteEshopProduct: (id: string | number) => `/eshop-products/${id}`,

    paymentProviders: () => "/payment-providers",
    createPaymentProvider: () => "/payment-providers/create",
    editPaymentProvider: (id: string | number) =>
        `/payment-providers/${id}/edit`,
    deletePaymentProvider: (id: string | number) => `/payment-providers/${id}`,
};
