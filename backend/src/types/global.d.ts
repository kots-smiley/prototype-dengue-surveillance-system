declare module 'dotenv' {
    export function config(options?: any): { error?: Error; parsed?: any };
}

declare module 'path' {
    function resolve(...pathSegments: string[]): string;
    function join(...paths: string[]): string;
    const sep: string;
    const delimiter: string;
    function dirname(p: string): string;
    function basename(p: string, ext?: string): string;
    function extname(p: string): string;
    function normalize(p: string): string;
    function isAbsolute(p: string): boolean;
    function relative(from: string, to: string): string;
    export = {
        resolve,
        join,
        sep,
        delimiter,
        dirname,
        basename,
        extname,
        normalize,
        isAbsolute,
        relative
    };
}

declare global {
    var console: {
        log(...args: any[]): void;
        error(...args: any[]): void;
        warn(...args: any[]): void;
        info(...args: any[]): void;
        debug(...args: any[]): void;
    };
    var process: {
        env: { [key: string]: string | undefined };
        cwd(): string;
        exit(code?: number): never;
    };
    var global: typeof globalThis;
    function setImmediate(callback: (...args: any[]) => void, ...args: any[]): any;
}

export { };

