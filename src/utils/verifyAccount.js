const { sendEmail } = require("./SendEmail")

const verifyAccount = ( email, firstName, frontBaseUrl, code ) => {
    sendEmail({
        to: email,
        subject: 'Verificacion de cuenta',
        html: `<div style="max-width: 500px; margin: 50px auto; background-color: #f8fafc; padding: 30px; border-radius: 10px; 
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); font-family: 'Arial', sans-serif; color: #333333;">
        <h1 style="color: #007BFF; font-size: 28px; text-align: center; margin-bottom: 20px;">¡Hola ${firstName.toUpperCase()} 👋!</h1>  
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 25px; text-align: center;">Gracias por registrarte en nuestra aplicación.
        Para verificar su cuenta, haga clic en el siguiente enlace:</p>  
        <div style="text-align: center;">  
        <a href="${frontBaseUrl}/verify_email/${code}" style="display: inline-block; background-color: #007BFF; color: #ffffff;
        text-align: center; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 18px;">¡Verificar cuenta!</a>
        </div>
        </div>`
    })


}

module.exports = {
    verifyAccount
}