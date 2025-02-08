import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string>  {
    try {
        const hash =  bcrypt.hash(password, 10);
        return hash;
    } catch (error) {
        console.log(error);
        throw new Error('Error hashing password'); 
    }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    try {
        const match = await bcrypt.compare(password, hash);
        return match;
    } catch (error) {
        console.log(error);
        throw new Error('Error comparing password'); 
    }
}