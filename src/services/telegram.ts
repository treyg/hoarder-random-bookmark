import { config } from '../utils/config'
import type { Bookmark } from '../api/types'

// Format bookmarks for Telegram message
export function formatTelegramMessage(bookmarks: Bookmark[]): string {
  console.log(
    'Formatting Telegram message for bookmarks:',
    JSON.stringify(bookmarks, null, 2)
  )

  let message = '🔖 *Your Random Bookmarks from Hoarder*\n\n'

  if (bookmarks.length === 0) {
    message +=
      'No bookmarks found\\. Please check your Hoarder API configuration\\.'
    return message
  }

  bookmarks.forEach((bookmark, index) => {
    const title = bookmark.title || 'Untitled Bookmark'
    const url = bookmark.url || ''

    // Escape special characters for Telegram MarkdownV2
    const escapedTitle = escapeMarkdownV2(title)
    const escapedDescription = bookmark.description ? escapeMarkdownV2(bookmark.description) : ''

    if (url) {
      message += `*${index + 1}\\. [${escapedTitle}](${url})*\n`
    } else {
      message += `*${index + 1}\\. ${escapedTitle}*\n`
    }

    if (escapedDescription) {
      message += `> ${escapedDescription}\n\n`
    }

    if (bookmark.tags && bookmark.tags.length > 0) {
      message += '*Tags:* '
      bookmark.tags.forEach(tag => {
        const escapedTag = escapeMarkdownV2(tag)
        message += `\`${escapedTag}\` `
      })
      message += '\n\n'
    } else {
      message += '\n'
    }

    message += '━━━━━━━━━━━━━━━━━━━━━\n\n'
  })

  return message
}

// Escape special characters for Telegram MarkdownV2
function escapeMarkdownV2(text: string): string {
  // Characters that need to be escaped in MarkdownV2
  const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
  
  let escaped = text
  specialChars.forEach(char => {
    escaped = escaped.replace(new RegExp('\\' + char, 'g'), '\\' + char)
  })
  
  return escaped
}

// Send Telegram message with bookmarks
export async function sendBookmarksTelegram(
  bookmarks: Bookmark[]
): Promise<void> {
  console.log(`Attempting to send ${bookmarks.length} bookmarks to Telegram`)

  try {
    if (!config.TELEGRAM_BOT_TOKEN) {
      throw new Error('Telegram bot token is not defined')
    }

    if (!config.TELEGRAM_CHAT_ID) {
      throw new Error('Telegram chat ID is not defined')
    }

    const message = formatTelegramMessage(bookmarks)
    
    console.log(
      `Sending message to Telegram chat ID: ${config.TELEGRAM_CHAT_ID}`
    )

    const response = await fetch(
      `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: false
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Telegram API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    console.log(
      `Message successfully sent to Telegram. Message ID: ${result.result.message_id}`
    )
  } catch (error: any) {
    console.error('Error sending Telegram message:', error)
    console.error('Error details:', error.message)
    throw error
  }
}