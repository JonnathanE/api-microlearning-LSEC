require('dotenv').config({ quiet: true });
const { z } = require('zod');

const optionalString = z.string().optional();

const schema = z
    .object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        PORT: z.coerce.number().int().positive().default(3000),
        DATABASE: optionalString,
        DATABASE_TEST: optionalString,
        JWT_SECRET: z.string().min(32, 'must be at least 32 characters (openssl rand -hex 32)'),
        CORS_ORIGINS: z
            .string()
            .default('http://localhost:3000')
            .transform((value) => value.split(',').map((origin) => origin.trim())),
        LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
        CLOUDINARY_CLOUD_NAME: optionalString,
        CLOUDINARY_API_KEY: optionalString,
        CLOUDINARY_API_SECRET: optionalString,
        ADMIN_NAME: z.string().default('admin'),
        ADMIN_EMAIL: optionalString,
        ADMIN_PASSWORD: optionalString,
    })
    .superRefine((env, ctx) => {
        const databaseKey = env.NODE_ENV === 'test' ? 'DATABASE_TEST' : 'DATABASE';
        if (!env[databaseKey]) {
            ctx.addIssue({ code: 'custom', path: [databaseKey], message: 'is required' });
        }
        if (env.NODE_ENV === 'production') {
            for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
                if (!env[key]) ctx.addIssue({ code: 'custom', path: [key], message: 'is required in production' });
            }
        }
    });

const result = schema.safeParse(process.env);
if (!result.success) {
    const issues = result.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment variables (see .env.example):\n${issues}`);
}

const env = result.data;

module.exports = {
    ...env,
    databaseUrl: env.NODE_ENV === 'test' ? env.DATABASE_TEST : env.DATABASE,
    logLevel: env.LOG_LEVEL ?? (env.NODE_ENV === 'test' ? 'silent' : 'info'),
};
