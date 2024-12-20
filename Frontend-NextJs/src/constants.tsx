// /src/constants.ts

export const token: string | null = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
export const username: string | null = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
export const apiBaseUrl: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;
export const STREAM_API_KEY: string = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';