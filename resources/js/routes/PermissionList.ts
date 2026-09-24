/**
 * PermissionList maps application features and resources to their permission keys.
 *
 * Backend permission naming convention (defined in CheckPermission.php & PermissionSeeder.php):
 * - Actions: index | view | store (create/add) | edit | destroy (delete)
 * - Resource: singular kebab-case of the route resource name (e.g., 'block-contents' -> 'block-content')
 * - Full permission: "{action}-{resource}" (e.g., "edit-block-content", "destroy-block-content")
 */

export interface ResourcePermissions {
    index: string;
    view: string;
    add: string;
    create: string;
    edit: string;
    delete: string;
    destroy: string;
    [key: string]: string | undefined;
}

const createCrudPermissions = <T extends Record<string, string> = {}>(
    resource: string,
    extra: T = {} as T
): ResourcePermissions & T => ({
    index: `index-${resource}`,
    view: `view-${resource}`,
    add: `store-${resource}`,
    create: `store-${resource}`,
    edit: `edit-${resource}`,
    delete: `destroy-${resource}`,
    destroy: `destroy-${resource}`,
    ...extra,
});

export type PermissionListType = {
    // Standalone
    dashboard: string;
    profile: string;

    // Plural resource objects (matching RouteList naming)
    posts: ResourcePermissions & { publish?: string };
    postCategories: ResourcePermissions;
    pages: ResourcePermissions & { publish?: string };
    blockContents: ResourcePermissions;
    eshopCategories: ResourcePermissions;
    eshopTags: ResourcePermissions;
    eshopAttributes: ResourcePermissions;
    eshopProducts: ResourcePermissions;
    stores: ResourcePermissions;
    holidays: ResourcePermissions;
    appointments: ResourcePermissions;
    orders: ResourcePermissions;
    clients: ResourcePermissions;
    promoCodes: ResourcePermissions;
    users: ResourcePermissions & { impersonate?: string };
    roles: ResourcePermissions;
    patients: ResourcePermissions;
    subscriptions: ResourcePermissions;
    languages: ResourcePermissions;
    paymentProviders: ResourcePermissions;
    uploads: ResourcePermissions;
    integrations: ResourcePermissions;
    emails: ResourcePermissions;
    emailTemplates: ResourcePermissions;

    // Singular aliases
    post: ResourcePermissions & { publish?: string };
    postCategory: ResourcePermissions;
    page: ResourcePermissions & { publish?: string };
    blockContent: ResourcePermissions;
    eshopCategory: ResourcePermissions;
    eshopTag: ResourcePermissions;
    eshopAttribute: ResourcePermissions;
    eshopProduct: ResourcePermissions;
    store: ResourcePermissions;
    holiday: ResourcePermissions;
    appointment: ResourcePermissions;
    order: ResourcePermissions;
    client: ResourcePermissions;
    promoCode: ResourcePermissions;
    user: ResourcePermissions & { impersonate?: string };
    role: ResourcePermissions;
    patient: ResourcePermissions;
    subscription: ResourcePermissions;
    language: ResourcePermissions;
    paymentProvider: ResourcePermissions;
    upload: ResourcePermissions;
    integration: ResourcePermissions;
    email: ResourcePermissions;
    emailTemplate: ResourcePermissions;

    [key: string]: any;
};

// Common resource definitions
const post = createCrudPermissions("post", { publish: "publish-post" });
const postCategory = createCrudPermissions("post-category");
const page = createCrudPermissions("page", { publish: "publish-page" });
const blockContent = createCrudPermissions("block-content");
const eshopCategory = createCrudPermissions("eshop-category");
const eshopTag = createCrudPermissions("eshop-tag");
const eshopAttribute = createCrudPermissions("eshop-attribute");
const eshopProduct = createCrudPermissions("eshop-product");
const store = createCrudPermissions("store");
const holiday = createCrudPermissions("holiday");
const appointment = createCrudPermissions("appointment");
const order = createCrudPermissions("order");
const client = createCrudPermissions("client");
const promoCode = createCrudPermissions("promo-code");
const user = createCrudPermissions("user", { impersonate: "impersonate-user" });
const role = createCrudPermissions("role");
const patient = createCrudPermissions("patient");
const subscription = createCrudPermissions("subscription");
const language = createCrudPermissions("language");
const paymentProvider = createCrudPermissions("payment-provider");
const upload = createCrudPermissions("upload");
const integration = createCrudPermissions("integration");
const email = createCrudPermissions("email");
const emailTemplate = createCrudPermissions("email-template");

export const PermissionList: PermissionListType = {
    // ----------------------------------------------------
    // Standalone
    // ----------------------------------------------------
    dashboard: "view-dashboard",
    profile: "view-profile",

    // ----------------------------------------------------
    // Plural resource objects (matching RouteList naming: orders, posts, appointments...)
    // Example: PermissionList.orders.create, PermissionList.orders.index
    // Example: pagePermissions={PermissionList.orders}
    // ----------------------------------------------------
    posts: post,
    postCategories: postCategory,
    pages: page,
    blockContents: blockContent,
    eshopCategories: eshopCategory,
    eshopTags: eshopTag,
    eshopAttributes: eshopAttribute,
    eshopProducts: eshopProduct,
    stores: store,
    holidays: holiday,
    appointments: appointment,
    orders: order,
    clients: client,
    promoCodes: promoCode,
    users: user,
    roles: role,
    patients: patient,
    subscriptions: subscription,
    languages: language,
    paymentProviders: paymentProvider,
    uploads: upload,
    integrations: integration,
    emails: email,
    emailTemplates: emailTemplate,

    // ----------------------------------------------------
    // Singular aliases (order, post, blockContent...)
    // ----------------------------------------------------
    post,
    postCategory,
    page,
    blockContent,
    eshopCategory,
    eshopTag,
    eshopAttribute,
    eshopProduct,
    store,
    holiday,
    appointment,
    order,
    client,
    promoCode,
    user,
    role,
    patient,
    subscription,
    language,
    paymentProvider,
    upload,
    integration,
    email,
    emailTemplate,

    // ----------------------------------------------------
    // Flat helpers (backward compatibility)
    // ----------------------------------------------------
    createPost: post.create,
    editPost: post.edit,
    deletePost: post.delete,

    createPostCategory: postCategory.create,
    editPostCategory: postCategory.edit,
    deletePostCategory: postCategory.delete,

    createPage: page.create,
    editPage: page.edit,
    deletePage: page.delete,

    createBlockContent: blockContent.create,
    editBlockContent: blockContent.edit,
    deleteBlockContent: blockContent.delete,

    createEshopCategory: eshopCategory.create,
    editEshopCategory: eshopCategory.edit,
    deleteEshopCategory: eshopCategory.delete,

    createEshopTag: eshopTag.create,
    editEshopTag: eshopTag.edit,
    deleteEshopTag: eshopTag.delete,

    createEshopAttribute: eshopAttribute.create,
    editEshopAttribute: eshopAttribute.edit,
    deleteEshopAttribute: eshopAttribute.delete,

    createEshopProduct: eshopProduct.create,
    editEshopProduct: eshopProduct.edit,
    deleteEshopProduct: eshopProduct.delete,

    createStore: store.create,
    editStore: store.edit,
    deleteStore: store.delete,

    createHoliday: holiday.create,
    editHoliday: holiday.edit,
    deleteHoliday: holiday.delete,

    createAppointment: appointment.create,
    editAppointment: appointment.edit,
    deleteAppointment: appointment.delete,

    createOrder: order.create,
    editOrder: order.edit,
    deleteOrder: order.delete,

    createClient: client.create,
    editClient: client.edit,
    deleteClient: client.delete,

    createPromoCode: promoCode.create,
    editPromoCode: promoCode.edit,
    deletePromoCode: promoCode.delete,

    createUser: user.create,
    editUser: user.edit,
    deleteUser: user.delete,

    createRole: role.create,
    editRole: role.edit,
    deleteRole: role.delete,

    deleteSubscription: subscription.delete,

    createLanguage: language.create,
    editLanguage: language.edit,
    deleteLanguage: language.delete,

    createPaymentProvider: paymentProvider.create,
    editPaymentProvider: paymentProvider.edit,
    deletePaymentProvider: paymentProvider.delete,

    createUpload: upload.create,
    deleteUpload: upload.delete,

    createIntegration: integration.create,
    editIntegration: integration.edit,
    deleteIntegration: integration.delete,

    createEmail: email.create,
    deleteEmail: email.delete,
};
