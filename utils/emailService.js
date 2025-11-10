import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    // Validate credentials
    if (!config.auth.user || !config.auth.pass) {
      console.error("❌ Email credentials missing!");
      console.error("EMAIL_USER:", config.auth.user ? "Set" : "Missing");
      console.error("EMAIL_PASS:", config.auth.pass ? "Set" : "Missing");
      throw new Error("Email credentials not configured properly");
    }

    transporter = nodemailer.createTransport(config);
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const emailTransporter = getTransporter();

    await emailTransporter.verify();

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        '"Richi & Ayman Properties" <aymansbeity00@gmail.com>',
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("❌ Error sending email to %s:", to, error.message);
    throw error;
  }
};

export const sendNewPropertyNotification = async (users, propertyData) => {
  try {
    const { title, city, property_type, listing_type, price } = propertyData;

    const emailPromises = users.map((user) => {
      const subject = `New Property Available: ${title}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Property Listed!</h2>
          <p>Hello ${user.name || "there"},</p>
          <p>A new property has been added to our listings that might interest you:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${title}</h3>
            <p style="margin: 10px 0;"><strong>Location:</strong> ${city}</p>
            <p style="margin: 10px 0;"><strong>Property Type:</strong> ${
              property_type || "N/A"
            }</p>
            <p style="margin: 10px 0;"><strong>Listing Type:</strong> ${
              listing_type || "N/A"
            }</p>
            ${
              price
                ? `<p style="margin: 10px 0;"><strong>Price:</strong> $${price.toLocaleString()}</p>`
                : ""
            }
          </div>
          
          <p>Visit our website to see more details and photos of this property.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            You're receiving this email because you're registered on our platform.
          </p>
        </div>
      `;

      const text = `
New Property Listed!

Hello ${user.name || "there"},

A new property has been added: ${title}
Location: ${city}
Property Type: ${property_type || "N/A"}
Listing Type: ${listing_type || "N/A"}
${price ? `Price: $${price.toLocaleString()}` : ""}

Visit our website to see more details.
      `;

      return sendEmail({
        to: user.email,
        subject,
        text,
        html,
      }).catch((err) => {
        console.error(`Failed to send email to ${user.email}:`, err.message);
        return null;
      });
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r !== null).length;

    console.log(
      `Sent ${successCount} out of ${users.length} new property notification emails`
    );
    return { success: successCount, total: users.length };
  } catch (error) {
    console.error("Error sending new property notifications:", error);
    throw error;
  }
};
