export const RouteList = {
    dashboard: () => "/dashboard",
    // post
    posts: () => "/posts",
    createPost: () => "/posts/create",
    editPost: (id) => `/posts/${id}`,
    // post category
    postCategories: () => "/post-categories",
    createPostCategory: () => "/post-categories/create",
    editPostCategory: (id) => `/post-categories/${id}`,
    // profile
    profile: () => "/profile",
    // roles
    roles: () => "/roles",
    createRole: () => "/roles/create",
    editRole: (id) => `/roles/${id}`,
    // users
    users: () => "/users",
    patients: () => "/patients",
    createUser: () => "/users/create",
    editUser: (id) => `/users/${id}`,
    // subscriptions
    subscriptions: () => "/subscriptions",
    subscriptionExport: () => "/subscriptions/export",
    deleteSubscription: (id) => `/subscriptions/${id}`,
    // uploads
    uploads: () => "/uploads",
    // languages
    languages: () => "/languages",
    createLanguage: () => "/languages/create",
    editLanguage: (id) => `/languages/${id}`,
    // emails
    emails: () => "/emails",
    createEmail: () => "/emails/create",
    editEmail: (id) => `/emails/${id}`,
    // pages
    pages: () => "/pages",
    createPage: () => "/pages/create",
    editPage: (id) => `/pages/${id}`,

    // block contents
    blockContents: () => "/block-contents",
    createBlockContent: () => "/block-contents/create",
    editBlockContent: (id) => `/block-contents/${id}`,

    // packages
    packages: () => "/packages",
    createPackage: () => "/packages/create",
    editPackage: (id) => `/packages/${id}`,

    // package attribute category
    packageAttributeCategories: () => "/packages/attribute-categories",
    createPackageAttributeCategory: () =>
        "/packages/attribute-categories/create",
    editPackageAttributeCategory: (id) =>
        `/packages/attribute-categories/${id}`,

    // package attribute
    packageAttributes: () => "/packages/attributes",
    createPackageAttribute: () => "/packages/attributes/create",
    editPackageAttribute: (id) => `/packages/attributes/${id}`,
    deletePackageAttribute: (id) => `/packages/attributes/${id}`,

    // package category
    packageCategories: () => "/packages/categories",
    createPackageCategory: () => "/packages/categories/create",
    editPackageCategory: (id) => `/packages/categories/${id}`,
    deletePackageCategory: (id) => `/packages/categories/${id}`,

    // package gender
    packageGenders: () => "/packages/genders",
    createPackageGender: () => "/packages/genders/create",
    editPackageGender: (id) => `/packages/genders/${id}`,
    deletePackageGender: (id) => `/packages/genders/${id}`,

    // package age
    packageAges: () => "/packages/ages",
    createPackageAge: () => "/packages/ages/create",
    editPackageAge: (id) => `/packages/ages/${id}`,
    deletePackageAge: (id) => `/packages/ages/${id}`,

    // package status
    packageStatuses: () => "/packages/statuses",
    createPackageStatus: () => "/packages/statuses/create",
    editPackageStatus: (id) => `/packages/statuses/${id}`,
    deletePackageStatus: (id) => `/packages/statuses/${id}`,

    // integrations
    integrations: () => "/integrations",
    createIntegration: () => "/integrations/create",
    editIntegration: (id) => `/integrations/${id}`,

    // promo codes
    promoCodes: () => "/promo-codes",
    createPromoCodes: () => "/promo-codes/create",
    editPromoCodes: (id) => `/promo-codes/${id}`,
    deletePromoCodes: (id) => `/promo-codes/${id}`,

    // clients
    clients: () => "/clients",
    createClients: () => "/clients/create",
    editCleint: (id) => `/clients/${id}`,
    deleteCleint: (id) => `/clients/${id}`,

    // store
    stores: () => "/stores",
    // createClients: () => "/clients/create",
    editStore: (id) => `/stores/${id}`,
    deleteStore: (id) => `/stores/${id}`,

    // holidays
    holidays: () => "/holidays",
    createHolidays: () => "/holidays/create",
    editHoliday: (id) => `/holidays/${id}`,
    deleteHoliday: (id) => `/holidays/${id}`,

    // appointments
    appointments: () => "/appointments",
    createAppointments: () => "/appointments/create",
    editAppointment: (id) => `/appointments/${id}`,
    deleteAppointment: (id) => `/appointments/${id}`,

    // orders
    orders: () => "/orders",
    createOrder: () => "/orders/create",
};
