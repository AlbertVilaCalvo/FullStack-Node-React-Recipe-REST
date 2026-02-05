import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { User } from '../user/User'
import { config } from '../config'
import { toError } from './util'

// https://nodemailer.com/about/

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
})

type EmailOptions = Required<
  Pick<Mail.Options, 'to' | 'subject' | 'text' | 'html'>
>

async function sendEmail(options: EmailOptions): Promise<void> {
  return transporter
    .sendMail({
      from: '"Recipe Manager" <donotreply@recipemanager.link>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    .then((info) => {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    })
}

function hiText(user: User): string {
  return `Hi ${user.name}!`
}

function hiHtml(user: User): string {
  return `<p>Hi ${user.name}!</p>`
}

/**
 * Alert the user that a new login was done with its account.
 */
export function sendLoginAlertEmail(user: User) {
  sendEmail({
    to: {
      name: user.name,
      address: user.email,
    },
    subject: 'New login at Recipe Manager',
    text: `${hiText(user)}
Your account was just used to log in at Recipe Manager.
If it was not you, please contact us at hello@recipemanager.link.`,
    html: `${hiHtml(user)}
<p>Your account was just used to log in at Recipe Manager.</p>
<p>If it was not you, <a href="mailto:hello@recipemanager.link">please contact us</a>.</p>`,
  }).catch((error) => {
    console.error(`sendLoginAlertEmail error`, error)
  })
}

export async function sendEmailVerificationEmail(
  user: User,
  verifyEmailLink: string,
  isRegister: boolean
): Promise<'success' | Error> {
  const subject = isRegister
    ? `Welcome to Recipe Manager ${user.name}!`
    : `Please verify your email address for Recipe Manager`

  let text = hiText(user)
  let html = hiHtml(user)
  if (isRegister) {
    text = text + `Welcome to Recipe Manager!`
    html = html + `<p>Welcome to Recipe Manager!</p>`
  }
  text =
    text +
    `To have full access to all Recipe Manager features, please verify your email address by visiting ${verifyEmailLink}`
  html =
    html +
    `<p>To have full access to all Recipe Manager features, please verify your email address by visiting <a href="${verifyEmailLink}">${verifyEmailLink}</a></p>`

  return sendEmail({
    to: {
      name: user.name,
      address: user.email,
    },
    subject: subject,
    text: text,
    html: html,
  })
    .then<'success'>(() => {
      return 'success'
    })
    .catch((error) => {
      console.error(`sendEmailVerificationEmail error`, error)
      return toError(error, 'sendEmailVerificationEmail')
    })
}

export async function sendResetPasswordEmail(
  user: User,
  passwordResetLink: string
): Promise<'success' | Error> {
  let text = hiText(user)
  let html = hiHtml(user)
  text = text + `Set a new password by visiting ${passwordResetLink}`
  html =
    html +
    `<p>Set a new password by visiting <a href="${passwordResetLink}">${passwordResetLink}</a></p>`

  return sendEmail({
    to: {
      name: user.name,
      address: user.email,
    },
    subject: 'Set your Recipe Manager password',
    text: text,
    html: html,
  })
    .then<'success'>(() => {
      return 'success'
    })
    .catch((error) => {
      console.error(`sendResetPasswordEmail error`, error)
      return toError(error, 'sendResetPasswordEmail')
    })
}
