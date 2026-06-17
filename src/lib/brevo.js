// import SibApiV3Sdk from "sib-api-v3-sdk";

// const defaultClient = SibApiV3Sdk.ApiClient.instance;
// defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

// const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// const sendVerificationCode = async (email, verificationCode) => {
//   const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
//   sendSmtpEmail.sender = { name: "Chat With Me", email: "emdigemini@gmail.com" };
//   sendSmtpEmail.to = [{ email: email }];
//   sendSmtpEmail.subject = "Chat With Me - Verification Code";
//   sendSmtpEmail.htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background-color: #f9f9f9; padding: 32px; border-radius: 8px;">
      
//       <h2 style="color: #4F46E5; text-align: center; margin-bottom: 4px;">Chat With Me</h2>
//       <p style="text-align: center; color: #888; font-size: 14px; margin-top: 0;">Account Verification</p>

//       <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

//       <p style="color: #333; font-size: 15px;">Hello,</p>
//       <p style="color: #555; font-size: 14px; line-height: 1.6;">
//         You recently requested to create an account on <b>Chat With Me</b>. 
//         Use the verification code below to complete your registration:
//       </p>

//       <div style="text-align: center; margin: 32px 0;">
//         <span style="
//           display: inline-block;
//           background-color: #4F46E5;
//           color: #ffffff;
//           font-size: 32px;
//           font-weight: bold;
//           letter-spacing: 12px;
//           padding: 16px 32px;
//           border-radius: 8px;
//         ">${verificationCode}</span>
//       </div>

//       <p style="color: #555; font-size: 13px; text-align: center;">
//         This code will expire in <b>90 seconds</b>.
//       </p>

//       <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

//       <p style="color: #aaa; font-size: 12px; text-align: center;">
//         If you did not request this, you can safely ignore this email.<br/>
//         &copy; ${new Date().getFullYear()} Chat With Me. All rights reserved.
//       </p>

//     </div>
//   `;

//   try {
//     console.time("brevo");
//     const results = await apiInstance.sendTransacEmail(sendSmtpEmail);
//     console.timeEnd("brevo");
//     console.log(results);
//   } catch (err) {
//     console.log('Error sending verification code', err);
//   }
// }

// export default sendVerificationCode