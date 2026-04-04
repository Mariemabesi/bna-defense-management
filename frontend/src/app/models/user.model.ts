export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
    token?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
}

export interface LoginResponse {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    firstName?: string;
    lastName?: string;
    fullName?: string;
}
