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
      from: '"Recipe Manager" <donotreply@recipemanager.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    .then((info) => {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    })
}

/**
 * Alert the user that a new login was done with its account.
 */
export function sendLoginEmail(user: User) {
  sendEmail({
    to: {
      name: user.name,
      address: user.email,
    },
    subject: 'New login at Recipe Manager',
    text: `Hi ${user.name}!
Your account was just used to log in at Recipe Manager.
If it was not you, please contact us at hello@recipemanager.com.`,
    html: `<p>Hi ${user.name}!</p>
<p>Your account was just used to log in at Recipe Manager.</p>
<p>If it was not you, <a href="mailto:hello@recipemanager.com">please contact us</a>.</p>`,
  }).catch((error) => {
    console.error(`sendLoginEmail error`, error)
  })
}

export async function sendEmailVerificationEmail(
  user: User,
  verifyEmailLink: string
): Promise<'success' | Error> {
  return sendEmail({
    to: {
      name: user.name,
      address: user.email,
    },
    subject: 'Please verify your email address - Recipe Manager',
    text: `Hi ${user.name}!
  Verify the email address to access Recipe Manager.
  Please visit ${verifyEmailLink}`,
    html: `<p>Hi ${user.name}!</p>
  <p>Verify the email address to access Recipe Manager.</p>
  <p>Please visit <a href="${verifyEmailLink}">${verifyEmailLink}</a>.</p>`,
  })
    .then<'success'>(() => {
      return 'success'
    })
    .catch((error) => {
      console.error(`sendEmailVerificationEmail error`, error)
      return toError(error, 'sendEmailVerificationEmail')
    })
}
