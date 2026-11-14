/** The development harness (/dev/editor) only exists when this is true. Production builds never have NODE_ENV=development. */
export const devHarnessEnabled = () => process.env.NODE_ENV === "development" && process.env.ADMIN_DEV_HARNESS === "1"
