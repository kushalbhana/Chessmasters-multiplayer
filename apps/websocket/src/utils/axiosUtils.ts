import axios from 'axios';

export async function postVerifyJWT(token: string) {
    try {
        const response = await axios.post('http://localhost:3000/api/verifyJWT', 
            { token },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response;
    } catch (error) {
        console.error('Error verifying JWT:', error);
        throw error;
    }
}
