/// <reference types="node" />

declare module 'dotenv' {
  export function config(options?: any): { error?: Error; parsed?: any };
}

declare global {
    var console: Console;
    var process: NodeJS.Process;
    var global: typeof globalThis;
    function setImmediate(callback: (...args: any[]) => void, ...args: any[]): NodeJS.Immediate;
}

export { };

