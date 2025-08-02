import nodemailer from "nodemailer";

/**
 * Send an email with a PDF attachment
 * @param {Buffer} pdfBuffer
 * @param {string} ClientEmail
 * @param {string} ClientName
 * @param {string} TDGINV
 */
export async function sendEmailWithPDF(pdfBuffer, mailData) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  const subject = `${mailData?.mailSubject}`;

  const mailOptions = {
    from: process.env.EMAIL_SENDER_NAME,
    to: `${mailData?.clientEmail},contact@tdsolar.in,tdsolar9@gmail.com`,
    //to: `${mailData?.clientEmail}`,
    //to: `tdsolar9@gmail.com`,
    subject,
    html: `
      <div style="background: linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%); padding: 32px 0;">
        <div style="max-width: 400px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); overflow: hidden;">
          <div style="background: #18aa48; padding: 24px 0; text-align: center;">
            <img src="https://tdsolar.in/cdn_images/TDlogo.png" alt="TD Solar Logo" style="height: 40px; margin-bottom: 10px;">
            <h1 style="color: #fff; margin: 0; font-size: 2rem; letter-spacing: 2px;">TD SOLAR</h1>
            <div style="color: #fff; font-size: 1.1rem; margin-top: 6px;">Empowering Your Future with Solar Green Energy</div>
          </div>
          <div style="padding: 32px 28px 24px 28px; font-family: 'Segoe UI', Arial, sans-serif; color: #222;">
            <p style="font-size: 1.1rem; margin-bottom: 0;">Hello <span style="color: #18aa48; font-weight: bold;">${mailData?.clientName}</span>,</p>
            <p style="margin-top: 8px;">
              <span style="font-size: 1.05rem;">Thank you for choosing <strong>TD Solar (Technical Dwipayan)</strong> for your solar energy needs.</span>
            </p>
            <div style="background: #e8f5e9; border-left: 5px solid #18aa48; padding: 18px 20px; margin: 24px 0; border-radius: 8px;">
              <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Invoice Icon" style="height: 32px; vertical-align: middle; margin-right: 10px;">
              <span style="font-size: 14 px; color: #18aa48; font-weight: bold;">
                Please Find The 📄 Attacement Below.
              </span>
            </div>
            <div style="background: #e8f5e9; border-left: 5px solid #18aa48; padding: 18px 20px; margin: 24px 0; border-radius: 8px;">
                <span style="font-size: 14 px; color: #4c01f9ff; font-weight: normal;">${mailData?.mailSubject}
              </span>
            </div>
            <p>
              <strong>What's Next?</strong><br>
              <ul style="margin: 10px 0 18px 18px; color: #444;">
                <li>Review the attached document .</li>
                <li>Contact us if you have any questions or need support.</li>
                <li>We look forward to serving you again!</li>
              </ul>
            </p>
            <div style="background: #e8f5e9; border-left: 5px solid #18aa48; padding: 18px 20px; margin: 24px 0; border-radius: 8px;">
              <span style="font-size: 14 px; color: #18aa48; font-weight: normal;">
                Please note your ID: <span style="font-size: 14 px; color: #b70287ff; font-weight: bold;">${mailData?.clientId} </span> for future reference.
              </span>
            </div>
            <div style="background: #f1f8e9; border-radius: 8px; padding: 14px 18px; margin-bottom: 18px;">
              <span style="color: #388e3c; font-size: 1rem;">
                <strong>Contact Us:</strong><br>
                📞 <a href="tel:+919775550672" style="color: #18aa48; text-decoration: none;">+91 97755 50672</a> &nbsp;|&nbsp;
                📞 <a href="tel:+919732550550" style="color: #18aa48; text-decoration: none;">+91 97325 50550</a> &nbsp;|&nbsp;
                📧 <a href="mailto:contact@tdsolar.in" style="color: #18aa48; text-decoration: none;">contact@tdsolar.in</a><br>
                🌐 <a href="https://tdsolar.in" style="color: #18aa48; text-decoration: none;">www.tdsolar.in</a>
              </span>
            </div>
            <p style="margin-top: 18px; color: #888; font-size: 0.98rem;">
              <em>Thank you for your trust in us. Together, let's build a greener tomorrow!</em>
            </p>
          </div>
          <div style="background: #18aa48; color: #fff; text-align: center; padding: 16px 16px; font-size: 0.95rem;">
            <img src="https://tdsolar.in/cdn_images/logo.png" alt="TD Solar" style="height: 32px; vertical-align: middle; margin-right: 8px;">
            &copy; ${new Date().getFullYear()} TD Solar (Technical Dwipayan) &mdash; All Rights Reserved.
          </div>
        </div>
        <div style="text-align: center; color: #aaa; font-size: 0.85rem; margin-top: 18px;">
          This is an automated email. Please do not reply to this message.
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `${mailData?.fileName}`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };
  if(process.env.NODE_ENV==='production' && process.env.EMAIL_ON==='true'){
    console.log("Inside Email Send "+process.env.NODE_ENV)
    await transporter.sendMail(mailOptions);
  }
}