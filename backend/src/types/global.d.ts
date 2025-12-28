declare module 'dotenv' {
    export function config(options?: any): { error?: Error; parsed?: any };
}

declare module 'path' {
    const path: {
        resolve(...pathSegments: string[]): string;
        join(...paths: string[]): string;
        sep: string;
        delimiter: string;
        dirname(p: string): string;
        basename(p: string, ext?: string): string;
        extname(p: string): string;
        normalize(p: string): string;
        isAbsolute(p: string): boolean;
        relative(from: string, to: string): string;
    };
    export = path;
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

