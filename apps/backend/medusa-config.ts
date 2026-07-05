import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    },
  },
  plugins: [
    {
      resolve: "medusa-premium-recovery",
      options: {},
    },
  ],
  admin: {
    vite: () => {
      return {
        optimizeDeps: {
          include: ["react-aria", "@react-aria/datepicker", "@react-aria/i18n"],
        },
      }
    },
  },
})