import type { UserDocument } from '../models/User.js';

declare global {
    namespace Express {
        interface Request {
            /** Authenticated user, set by the authenticate middleware */
            user?: UserDocument;
            /** Parsed query, set by the validate middleware (req.query is read-only in Express 5) */
            validatedQuery?: unknown;
        }
    }
}
