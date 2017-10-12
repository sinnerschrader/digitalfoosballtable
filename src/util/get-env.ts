export function getEnv(name: string): string {
    if (!(name in process.env)) {
        throw new Error(`Missing required environment variable ${name}`);
    }
    return process.env[name] || '';
}