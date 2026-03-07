export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
    token?: string;
}

export interface LoginResponse {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
}
