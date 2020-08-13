#!/usr/bin/env node
import server from '../generate/server.js';
import client from '../generate/client.js';
export declare const generate: (parts: 'all' | 'client' | 'server', schema: object, tokenPath?: string | undefined) => Promise<{
    server: string | undefined;
    client: string | undefined;
}>;
export declare const writeFile: (input: {
    server: string | undefined;
    client: string | undefined;
}, outputFilename: string, outputDir: string) => Promise<void>;
export declare const cliProgram: (input: string, output: string, parts?: 'all' | 'client' | 'server', tokenPath?: string | undefined) => Promise<void>;
