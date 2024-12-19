export type AuthorizationResponse = {
    status: number;
    data: {
        user:{
            userId: string;  // Assuming userId is directly under data, if it's nested adjust accordingly
        }
    };
}

export const AUTH_STATUS_MESSAGES = {
    200: 'Authorized token',
    498: 'Invalid Token',
    500: 'Token expired',
    403: 'Web Token Error',
    401: 'Token not valid',
    UNKNOWN: 'An unknown error occurred'
};


export type NodeType = 'sender' | 'receiver';