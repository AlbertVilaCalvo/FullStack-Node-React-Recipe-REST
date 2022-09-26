import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { User } from '../user/User'
import { config } from '../config'

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

async function sendEmail(options: EmailOptions) {
  const info = await transporter.sendMail({
    from: '"Recipe Manager" <donotreply@recipemanager.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  })
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
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
