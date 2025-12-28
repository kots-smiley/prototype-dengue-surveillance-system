declare module 'dotenv' {
    export function config(options?: any): { error?: Error; parsed?: any };
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

