import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string>  {
    try {
        const hash =  bcrypt.hash(password, 10);
        return hash;
    } catch (error) {
        throw new Error('Error hashing password'); 
    }

}