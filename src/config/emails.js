import * as brevo from "@getbrevo/brevo";

const instanceAPI = new brevo.TransactionalEmailsApi();

instanceAPI.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

async function sendRegisterEmail(email, name) {
  try {
    const smtpEmail = new brevo.SendSmtpEmail();
    smtpEmail.subject = "Welcome to Moda Lab";
    smtpEmail.templateId = 3;
    smtpEmail.sender = {
      name: "Team Moda Lab",
      email: "modalabteam@modalab.co",
    };
    smtpEmail.to = [{ email: email, name: name }];

    await instanceAPI.sendTransacEmail(smtpEmail);
  } catch (error) {
    console.error(error);
  }
}

async function sendActivationEmailBrands(
  user,
  token,
  company,
  newBrandDetails,
  addresses
) {
  const activationLink = `${process.env.FRONTEND_URL}/service/activate-brand/${token}`;
  try {
    const smtpEmail = new brevo.SendSmtpEmail();
    smtpEmail.subject = "Activate your account";
    smtpEmail.sender = {
      name: "Team Moda Lab",
      email: "modalabteam@modalab.co",
    };
    smtpEmail.to = [
      { email: "maria@modalab.co", name: "Maria Alejandra Gutierrez" },
    ];
    smtpEmail.htmlContent = `
      <h3>Enable User Request</h3>
      <p>Hello Maria Alejandra Gutierrez,</p>
      <p>The user ${
        user.name
      } has requested to be enabled. Please click on the following link to activate the user:</p>
      <a href="${activationLink}">Activate User</a>

      <h4>Business Information</h4>
      <p>Company: ${company.name}</p>
      <p>Business Type: Brand</p>
      <p>Categories: ${newBrandDetails.categories}</p>
      <p>Wholesale Markup: ${newBrandDetails.wholesale_markup}</p>
      <p>Retail Price Start: ${newBrandDetails.retail_price_start}</p>
      <p>Retail Price End: ${newBrandDetails.retail_price_end}</p>
      <p>Physical Store: ${newBrandDetails.physical_store ? "Yes" : "No"}</p>
      <p>Instagram: <a href="https://www.instagram.com/${
        newBrandDetails.social_media[0]
      }">${newBrandDetails.social_media[0]}</a></p>
      <p>Website: <a href="${newBrandDetails.website}">${
      newBrandDetails.website
    }</a></p>
      <p>Phone: ${user.phone_number}</p>

      <h4>Address</h4>
      <p>${addresses[0].address}</p>
      <p>${addresses[0].city}, ${addresses[0].state}, ${
      addresses[0].country
    }</p>
      <p>${addresses[0].zipCode}</p>
      <p>${addresses[0].moreInfo}</p>


      <p>Best regards,</p>
      <strong>Team Moda Lab</strong>
    `;
    await instanceAPI.sendTransacEmail(smtpEmail);
  } catch (error) {
    console.error(error);
  }
}

// Enviar correo de activación a los administradores
async function sendActivationEmailToAdmin(
  user,
  token,
  company,
  retailersDetailsInput,
  addresses
) {
  const activationLink = `${process.env.FRONTEND_URL}/service/activate/${token}`;
  try {
    const smtpEmail = new brevo.SendSmtpEmail();
    smtpEmail.subject = "Enable User Request";
    smtpEmail.sender = {
      name: "Team Moda Lab",
      email: "modalabteam@modalab.co",
    };
    smtpEmail.to = [{ email: "ana@modalab.co", name: "Ana María Zuñiga" }];
    smtpEmail.htmlContent = `
      <h3>Enable User Request</h3>
      <p>Hello Ana María Zuñiga,</p>
      <p>The user ${user.name} has requested to be enabled. Please click on the following link to activate the user:</p>
      <a href="${activationLink}">Activate User</a>

      <h4>Business Information</h4>
      <p>Company: ${company.name}</p>
      <p>Business Type: Retailer</p>
      <p>Instagram: <a href="https://www.instagram.com/${retailersDetailsInput.social_media[0]}">${retailersDetailsInput.social_media[0]}</a></p>
      <p>Website: <a href="${retailersDetailsInput.website}">${retailersDetailsInput.website}</a></p>
      <p>Phone: ${user.phone_number}</p>

      <h4>Address</h4>
      <p>${addresses[0].address}</p>
      <p>${addresses[0].city}, ${addresses[0].state}, ${addresses[0].country}</p>
      <p>${addresses[0].zipCode}</p>
      <p>${addresses[0].moreInfo}</p>


      <p>Best regards,</p>
      <strong>Team Moda Lab</strong>
    `;

    await instanceAPI.sendTransacEmail(smtpEmail);
  } catch (error) {
    console.error(error);
  }
}

async function sendConfirmationEmail(email, name) {
  try {
    const smtpEmail = new brevo.SendSmtpEmail();
    smtpEmail.subject = "Account Activated";
    smtpEmail.templateId = 4;
    smtpEmail.sender = {
      name: "Team Moda Lab",
      email: "modalabteam@modalab.co",
    };
    smtpEmail.to = [{ email: email, name: name }];
    await instanceAPI.sendTransacEmail(smtpEmail);
  } catch (error) {
    console.error(error);
  }
}

async function sendResetPasswordEmail(email, name, token) {
  try {
    const smtpEmail = new brevo.SendSmtpEmail();
    smtpEmail.subject = "Reset Password";
    smtpEmail.sender = {
      name: "Team Moda Lab",
      email: "modalabteam@modalab.co",
    };
    smtpEmail.to = [{ email: email, name: name }];
    smtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Poppins', sans-serif;
                    color: #620026 !important;
                    line-height: 1.6;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                }
                h3 {
                    color: #000000 !important;
                }
                .button {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    color: #ffffff !important;
                    background-color: #000000;
                    text-decoration: none;
                    font-weight: 300;
                }
                .button:hover {
                    opacity: 0.8;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #666;
                }
            </style>
        </head>
        <body>
          <div class="container">
            <h3>Password Reset Request</h3>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Click the button below to set a new password. This link will expire after a certain period.</p>
            <a href="${process.env.FRONTEND_URL}/forgot-password?token=${token}" class="button">Reset Password</a>
            <p class="footer">If you didn't request this, please ignore this email.</p>
            <p class="footer">Best regards,<br>Team Moda Lab</p>
          </div>
        </body>
      </html>

    `;
    await instanceAPI.sendTransacEmail(smtpEmail);
  } catch (error) {
    console.error(error);
  }
}

async function sendOrderToAdmin(
  user,
  products,
  shippingAddress,
  total,
  serial
) {
  try {
    const smtpEmail = new brevo.SendSmtpEmail();
    smtpEmail.subject = "New Order Created";
    smtpEmail.sender = {
      name: "Team Moda Lab",
      email: "modalabteam@modalab.co",
    };
    smtpEmail.to = [
      { email: "maria@modalab.co", name: "Maria Alejandra Gutierrez" },
    ];

    // Formatear precios en dólares
    const formatCurrency = (amount) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

    smtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Created</title>
          <style>
            body {
              font-family: 'Poppins', sans-serif;
              color: #620026 !important;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background-color: #f9f9f9;
            }
            h3 {
              color: #000000 !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 12px;
              border: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #000000;
              color: #ffffff !important;
            }
            .total {
              font-weight: bold;
              text-align: right;
            }
            .footer {
              margin-top: 20px;
              font-size: 0.9em;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h3>New Order Created</h3>
            <p>Hello Team,</p>
            <p>A new order has been created. Here are the details:</p>
            <p><strong>Order Serial Number:</strong> ${serial}</p>
            <p><strong>Customer Name:</strong> ${user.name}</p>
            <p><strong>Customer Email:</strong> ${user.email}</p>
            <p><strong>Customer Phone:</strong> ${user.phone_number}</p>
            <p><strong>Shipping Details:</strong></p>
            <ul>
              <li><strong>Address:</strong> ${shippingAddress.address}</li>
              <li><strong>Country:</strong> ${shippingAddress.country}</li>
              <li><strong>State:</strong> ${shippingAddress.state}</li>
              <li><strong>City:</strong> ${shippingAddress.city}</li>
              <li><strong>Zip Code:</strong> ${shippingAddress.zipCode}</li>
              <li><strong>More Info:</strong> ${shippingAddress.moreInfo}</li>
            </ul>
            <table>
              <thead>
                <tr>
                  <th>Designer</th>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.designer}</td>
                    <td>${product.product_name}</td>
                    <td>${product.size}</td>
                    <td>${product.color}</td>
                    <td>${product.quantity}</td>
                    <td>${formatCurrency(product.price)}</td>
                    
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <p class="total">Total Amount: ${formatCurrency(total)}</p>
            <p class="footer">This is an automated email, please do not reply.</p>
            <p class="footer">Best regards,<br>Team Moda Lab</p>
          </div>
        </body>
      </html>
    `;
    await instanceAPI.sendTransacEmail(smtpEmail);
  } catch (error) {
    console.error(error);
  }
}

async function sendOrderConfirmationToUser(user, products, total, serial) {
  try {
    const smtpEmail = new brevo.SendSmtpEmail();
    smtpEmail.subject = "Order Confirmation - Moda Lab";
    smtpEmail.sender = {
      name: "Team Moda Lab",
      email: "modalabteam@modalab.co",
    };
    smtpEmail.to = [{ email: user.email, name: user.name }];
    // Formatear precios en dólares
    const formatCurrency = (amount) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    smtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body {
              font-family: 'Poppins', sans-serif;
              color: #620026 !important;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background-color: #f9f9f9;
            }
            h3 {
              color: #000000 !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 12px;
              border: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #000000;
              color: #ffffff !important;
            }
            .total {
              font-weight: bold;
              text-align: right;
            }
            .footer {
              margin-top: 20px;
              font-size: 0.9em;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h3>Order Confirmation</h3>
            <p>Dear ${user.name},</p>
            <p>Thank you for your purchase! We have received your order and are currently processing it. Here are the details:</p>
            <p><strong>Order Serial Number:</strong> ${serial}</p>
            <table>
              <thead>
                <tr>
                  <th>Designer</th>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${products
                  .map(
                    (product) => `
                  <tr>
                    <td>${product.designer}</td>
                    <td>${product.product_name}</td>
                    <td>${product.size}</td>
                    <td>${product.color}</td>
                    <td>${product.quantity}</td>
                    <td>${formatCurrency(product.price)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <p class="total">Total Amount: ${formatCurrency(total)}</p>
            <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:modalabteam@modalab.co">modalabteam@modalab.co</a>.</p>
            <p class="footer">Thank you for choosing Moda Lab!</p>
            <p class="footer">Best regards,<br>Team Moda Lab</p>
          </div>
        </body>
      </html>
    `;
    await instanceAPI.sendTransacEmail(smtpEmail);
  } catch (error) {
    console.error(error);
  }
}

async function sendConfirmUserWithData(user) {
  try {
    const smtpEmail = new brevo.SendSmtpEmail();
    smtpEmail.subject = "Account Successfully Created!";
    smtpEmail.sender = {
      name: "Team Moda Lab",
      email: "modalabteam@modalab.co",
    };
    smtpEmail.to = [{ email: user.email, name: user.name }];
    smtpEmail.htmlContent = `
      <h3>Activate your account</h3>
      <p>Hi there!</p>
      <p>Thank you for registering with Moda Lab. Please click on the following link to activate your account:</p>
      <p><a href="https://modalab.co/login">Log in to your account</a></p>
      <p>Here you will find your credential for log in:</p>
      <p>Email: ${user.email}</p>
      <p>Password: ${user.password}</p>
      <p>Best regards,</p>
      <strong>Team Moda Lab</strong>
    `;
    await instanceAPI.sendTransacEmail(smtpEmail);
  } catch (error) {
    console.error(error);
  }
}

export {
  sendRegisterEmail,
  sendActivationEmailToAdmin,
  sendConfirmationEmail,
  sendActivationEmailBrands,
  sendResetPasswordEmail,
  sendOrderToAdmin,
  sendOrderConfirmationToUser,
  sendConfirmUserWithData,
};
