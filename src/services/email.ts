import nodemailer from 'nodemailer'
import { config } from '../utils/config'
import type { Bookmark } from '../api/hoarder'

// Create transporter object for sending emails
const transporter = nodemailer.createTransport({
  service: config.EMAIL_SERVICE,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
})

// Format bookmarks into HTML for email
function formatBookmarksHtml(bookmarks: Bookmark[]): string {
  if (bookmarks.length === 0) {
    return `
      <h1>📚 Your Random Bookmarks from Hoarder 📚</h1>
      <p>No bookmarks found. Please check your Hoarder API configuration.</p>
    `
  }

  return `
    <h1>📚 Your Random Bookmarks from Hoarder 📚</h1>
    <div style="max-width: 800px; margin: 0 auto;">
      ${bookmarks
        .map((bookmark, index) => {
          const title = bookmark.title || 'Untitled Bookmark'
          const url = bookmark.url || ''

          return `
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; margin-bottom: 10px;">
          ${index + 1}. ${
            url
              ? `<a href="${url}" style="color: #0366d6; text-decoration: none;">${title}</a>`
              : title
          }
        </h2>
        ${
          bookmark.description
            ? `<blockquote style="margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; color: #555;">${bookmark.description}</blockquote>`
            : ''
        }
        ${
          bookmark.tags && bookmark.tags.length > 0
            ? `<p><strong>Tags:</strong> ${bookmark.tags
                .map(
                  tag =>
                    `<code style="background-color: #f1f1f1; padding: 2px 5px; border-radius: 3px; font-family: monospace;">${tag}</code>`
                )
                .join(' ')}</p>`
            : ''
        }
      </div>
      <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
    `
        })
        .join('')}
      <p style="font-style: italic; color: #666; margin-top: 20px;">Sent by your Hoarder Bookmark Sender</p>
    </div>
  `
}

// Format bookmarks into plain text for email
function formatBookmarksText(bookmarks: Bookmark[]): string {
  if (bookmarks.length === 0) {
    return '📚 Your Random Bookmarks from Hoarder 📚\n\nNo bookmarks found. Please check your Hoarder API configuration.'
  }

  let message = '📚 Your Random Bookmarks from Hoarder 📚\n\n'

  bookmarks.forEach((bookmark, index) => {
    const title = bookmark.title || 'Untitled Bookmark'
    const url = bookmark.url || ''

    message += `${index + 1}. ${title}\n`
    if (url) {
      message += `   ${url}\n`
    }
    if (bookmark.description) {
      message += `   > ${bookmark.description}\n\n`
    }
    if (bookmark.tags && bookmark.tags.length > 0) {
      message += '   Tags: '
      bookmark.tags.forEach(tag => {
        message += `[${tag}] `
      })
      message += '\n'
    }
    message += '\n----------------------------------------\n\n'
  })

  return message
}

// Send email with bookmarks
export async function sendBookmarksEmail(bookmarks: Bookmark[]): Promise<void> {
  try {
    const mailOptions = {
      from: config.EMAIL_USER,
      to: config.EMAIL_RECIPIENT,
      subject: 'Your Random Bookmarks from Hoarder',
      text: formatBookmarksText(bookmarks),
      html: formatBookmarksHtml(bookmarks)
    }

    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
