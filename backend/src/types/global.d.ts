/// <reference types="node" />

declare module 'dotenv' {
    export function config(options?: any): { error?: Error; parsed?: any };
}

declare module 'path' {
    export function resolve(...pathSegments: string[]): string;
    export function join(...paths: string[]): string;
    export const sep: string;
    export const delimiter: string;
    export function dirname(p: string): string;
    export function basename(p: string, ext?: string): string;
    export function extname(p: string): string;
    export function normalize(p: string): string;
    export function isAbsolute(p: string): boolean;
    export function relative(from: string, to: string): string;
}

declare global {
    var console: Console;
    var process: NodeJS.Process;
    var global: typeof globalThis;
    function setImmediate(callback: (...args: any[]) => void, ...args: any[]): NodeJS.Immediate;
}

export { };

