import axios from 'axios'
import { config } from '../utils/config'
import type { Bookmark } from '../api/types'

// Format bookmarks for Mattermost message (Markdown)
export function formatMattermostMessage(bookmarks: Bookmark[]): string {
  let message = '#### Your Random Bookmarks from Hoarder\n\n'
  if (bookmarks.length === 0) {
    message += 'No bookmarks found. Please check your Hoarder API configuration.'
    return message
  }
  bookmarks.forEach((bookmark, index) => {
    const title = bookmark.title || 'Untitled Bookmark'
    const url = bookmark.url || ''
    if (url) {
      message += `${index + 1}. [${title}](${url})\n`
    } else {
      message += `${index + 1}. ${title}\n`
    }
    if (bookmark.description) {
      message += `> ${bookmark.description}\n`
    }
    if (bookmark.tags && bookmark.tags.length > 0) {
      message += 'Tags: '
      message += bookmark.tags.map(tag => `[32m[1m${tag}[0m`).join(', ')
      message += '\n'
    }
    message += '-----------------------------\n'
  })
  return message
}

// Send bookmarks to Mattermost via webhook
export async function sendBookmarksMattermost(bookmarks: Bookmark[]): Promise<void> {
  const webhookUrl = config.MATTERMOST_WEBHOOK_URL
  if (!webhookUrl) {
    throw new Error('Mattermost webhook URL is not defined in config')
  }
  const text = formatMattermostMessage(bookmarks)
  try {
    await axios.post(webhookUrl, { text })
    console.log('Successfully sent bookmarks to Mattermost.')
  } catch (error: any) {
    console.error('Error sending Mattermost notification:', error?.message)
    throw error
  }
}
