// client/src/constants.ts

export const token: string | null = localStorage.getItem('token');
export const username: string | null = localStorage.getItem('username');
export const apiBaseUrl: string | undefined = process.env.REACT_APP_API_BASE_URL;
