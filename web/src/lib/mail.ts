import nodemailer from "nodemailer";

// Envoi d'email admin via SMTP Gmail (mot de passe d'application).
// Échec silencieux : un problème SMTP ne doit jamais bloquer le client.
let transporter: nodemailer.Transporter | null | undefined;

function getTransporter() {
  if (transporter === undefined) {
    transporter = process.env.SMTP_PASS
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT || 465),
          secure: process.env.SMTP_SECURE !== "false",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          connectionTimeout: 8000,
        })
      : null;
  }
  return transporter;
}

// Email vers un utilisateur (vérification d'adresse, etc.) — même transport, échec silencieux.
// La version texte améliore la délivrabilité (les filtres anti-spam aiment multipart).
export async function sendUserMail(to: string, subject: string, html: string, text?: string) {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || "Mbila <mbilaservice@gmail.com>",
      to,
      subject,
      html: `<div style="font-family:system-ui;max-width:520px">${html}</div>`,
      text: text ?? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    });
    return true;
  } catch (e) {
    console.error("[mail] envoi utilisateur échoué:", (e as Error).message);
    return false;
  }
}

export async function notifyAdmin(subject: string, html: string) {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || "Mbila <mbilaservice@gmail.com>",
      to: process.env.MAIL_TO || "mbilaservice@gmail.com",
      subject,
      html: `<div style="font-family:system-ui;max-width:520px">${html}</div>`,
    });
  } catch (e) {
    console.error("[mail] envoi échoué:", (e as Error).message);
  }
}
