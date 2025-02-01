import { Resend } from "resend"
import path from "path";
import fs from "fs";

let emailTemplateCache: string | null = null;

export async function sendEmail(userEmail: string, subject: string, emailBody: string) {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const myEmail = "MERN <express@resend.dev>";

    try {
        const response = await resend.emails.send({
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

export  function getEmailTemplate(link: string, token: string, template: string): string {
    const filePath = path.join(__dirname, `../templates/${template}.html`);

    try {
        if (!emailTemplateCache) {
            emailTemplateCache =  fs.readFileSync(filePath, "utf8");
        }

        const emailBody = emailTemplateCache
            .replace(/{{TOKEN}}/g, token)
            .replace(/{{LINK}}/g, link);

        return emailBody;
    } catch (error) {
        console.error("Error Reading email template", error);
        throw new Error("Failed to load email template");
    };
};