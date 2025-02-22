import { Resend } from "resend"
import path from "path";
import fs from "fs";

const emailTemplateCache: Record<string, string> = {}; 

export async function sendEmail(userEmail: string, subject: string, emailBody: string) {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const myEmail = "MERN <express@resend.dev>";

    try {
        await resend.emails.send({
            from: myEmail,
            to: [userEmail],
            subject: subject,
            html: emailBody,
        });
    } catch (error) {
        console.log(error);    
        throw error;
    };
};

export function getEmailTemplate(template: string, link?: string | null, token?: string | null): string {
    const filePath = path.join(__dirname, `../templates/${template}.html`);

    try {
        if (!emailTemplateCache[template]) {
            emailTemplateCache[template] = fs.readFileSync(filePath, "utf8");
        }

        let emailBody = emailTemplateCache[template];

        if (token) {
            emailBody = emailBody.replace(/{{TOKEN}}/g, token);
        }
        
        if (link) {
            emailBody = emailBody.replace(/{{LINK}}/g, link);
        }

        return emailBody;
    } catch (error) {
        console.error("Error reading email template:", error);
        throw new Error("Failed to load email template");
    }
}