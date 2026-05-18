import nodemailer from "nodemailer";

// ── Create transporter ────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Replace {{fieldName}} variables in a string ───────────

export function replaceVariables(template, data) {
  if (!template) return "";

  let result = template;

  // Replace {{*}} with full HTML table of all fields
  if (result.includes("{{*}}")) {
    const tableRows = Object.entries(data)
      .map(([key, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">${key}</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;">${value ?? ""}</td>
        </tr>`)
      .join("");

    const table = `
      <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px;">
        ${tableRows}
      </table>`;

    result = result.replace(/\{\{\*\}\}/g, table);
  }

  // Replace individual {{fieldName}} variables
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      value ?? "",
    );
  });

  return result;
}

// ── Send a single email ───────────────────────────────────

export async function sendEmail({ to, cc, bcc, replyTo, from, subject, html }) {
  const transporter = createTransporter();

  await transporter.sendMail({
    to,
    cc:      cc      || undefined,
    bcc:     bcc     || undefined,
    replyTo: replyTo || undefined,
    from:    from    || process.env.SMTP_FROM || process.env.SMTP_USER,
    subject,
    html,
  });
}

// ── Process all email configs for a form submission ───────

export async function sendFormEmails(emailConfigs, submissionData) {
  if (!emailConfigs?.length) return;

  const errors = [];

  for (const emailConfig of emailConfigs) {
    try {
      const subject = replaceVariables(emailConfig.subject, submissionData);
      const html    = replaceVariables(emailConfig.message, submissionData);

      // Convert plain text to basic HTML if needed
      const htmlBody = html.includes("<")
        ? html
        : html.replace(/\n/g, "<br/>");

      await sendEmail({
        to:      replaceVariables(emailConfig.emailTo,   submissionData),
        cc:      replaceVariables(emailConfig.cc,        submissionData),
        bcc:     replaceVariables(emailConfig.bcc,       submissionData),
        replyTo: replaceVariables(emailConfig.replyTo,   submissionData),
        from:    replaceVariables(emailConfig.emailFrom, submissionData),
        subject,
        html:    htmlBody,
      });
    } catch (err) {
      console.error(`[email] Failed to send email config:`, err);
      errors.push(err.message);
    }
  }

  return errors;
}