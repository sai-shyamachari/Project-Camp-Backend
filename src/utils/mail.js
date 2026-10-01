import mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const emailGenerator = new mailgen({
        theme : "default" ,
        product : {
            name : "Project Management",
            link : "https://project-management.com/"
        }
    })

    const emailTextual = emailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = emailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport(
        {
            host : process.env.MAILTRAP_SMTP_HOST,
            port : process.env.MAILTRAP_SMTP_PORT,
            auth :{
                user : process.env.MAILTRAP_SMTP_USER,
                pass : process.env.MAILTRAP_SMTP_PASS
            }
        }
    )

    const mail = {
        from : "mail.projectmanager@example.com",
        to : options.email,
        subject : options.subject,
        text : emailTextual,
        html : emailHtml
    }

    try {
        await transporter.sendMail(mail);
    } catch (e) {
        console.error("error happen in mail service please check the credentials and the mail service" , e);
        
    }
}

const gmailVerificationContent = (username, VerificationUrl) => {
    return {
        body :{
            name : username,
            intro : "Welcome to Project Management! We're very excited to have you on board.",
            action : {
                instructions : "To get started with Project Management, please click here:",
                button : {
                    color : "#22BC66",
                    text : "click here to confirm your account",
                    link : VerificationUrl
                },
            },
            outro : "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}


const passwordResetContent = (username, passwordResetUrl) => {
    return {
        body :{
            name : username,
            intro : "We got a request to reset your password.",
            action : {
                instructions : "To reset your password, please click here:",
                button : {
                    color : "#bc2222",
                    text : "click here to reset your password",
                    link : passwordResetUrl
                },
            },
            outro : "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

export {
    gmailVerificationContent,
    passwordResetContent,
    sendEmail
}