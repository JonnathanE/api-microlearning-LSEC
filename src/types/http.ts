import type { RequestHandler } from 'express';

/** Params of a route whose segments are ids, e.g. IdParams<'moduleId'> */
export type IdParams<Name extends string> = Record<Name, string>;

/** Middleware that can be chained with handlers typed with their own params and body */
// biome-ignore lint/suspicious/noExplicitAny: Express requires every handler of a route to share the same generics
export type AnyRequestHandler = RequestHandler<any, any, any, any>;
