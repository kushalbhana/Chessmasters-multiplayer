import axios from 'axios';

export async function postVerifyJWT(token: string) {
    try {
        const response = await axios.post( `${process.env.WEBSITE_LINK}/api/verifyJWT`, 
            { token },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response;
    } catch (error) {
        console.error('Error verifying JWT:', error);
        throw error;
    }
}
