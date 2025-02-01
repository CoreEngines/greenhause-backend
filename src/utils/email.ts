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

export  function getEmailTemplate(verificationTokenLink: string, verificationToken: string): string {
    const filePath = path.join(__dirname, "../templates/verificationEmailTemplate.html");

    try {
        if (!emailTemplateCache) {
            emailTemplateCache =  fs.readFileSync(filePath, "utf8");
        }

        const emailBody = emailTemplateCache
            .replace(/{{VERIFICATION_TOKEN}}/g, verificationToken)
            .replace(/{{VERIFICATION_LINK}}/g, verificationTokenLink);

        return emailBody;
    } catch (error) {
        console.error("Error Reading email template", error);
        throw new Error("Failed to load email template");
    };
};