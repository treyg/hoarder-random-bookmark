import cron from 'node-cron'
import { config } from '../utils/config'
import { getRandomBookmarks } from '../api/hoarder'
import { sendBookmarksEmail } from './email'
import { sendBookmarksDiscord } from './discord'

// Define cron expressions for different frequencies
const cronExpressions = {
  daily: '0 9 * * *', // Every day at 9 AM
  weekly: '0 9 * * 1', // Every Monday at 9 AM
  monthly: '0 9 1 * *' // First day of every month at 9 AM
}

// Send notifications with bookmarks
async function sendNotification() {
  try {
    console.log('=== STARTING BOOKMARK NOTIFICATION PROCESS ===')
    console.log('Preparing to send bookmarks notification...')
    console.log(`Using notification method: ${config.NOTIFICATION_METHOD}`)
    console.log(
      `Requesting ${config.BOOKMARKS_COUNT} random bookmarks${
        config.SPECIFIC_LIST_ID ? ` from list ${config.SPECIFIC_LIST_ID}` : ''
      }`
    )

    // Get random bookmarks based on configuration
    const bookmarks = await getRandomBookmarks(
      config.BOOKMARKS_COUNT,
      config.SPECIFIC_LIST_ID
    )

    console.log(`Retrieved ${bookmarks.length} bookmarks`)

    if (bookmarks.length === 0) {
      console.log('No bookmarks available to send')
      return
    }

    // Log bookmark details
    bookmarks.forEach((bookmark, index) => {
      console.log(`Bookmark ${index + 1}:`, {
        id: bookmark.id,
        title: bookmark.title || 'Untitled',
        url: bookmark.url || 'No URL',
        tags: bookmark.tags || []
      })
    })

    // Send notifications based on configured method
    if (config.NOTIFICATION_METHOD === 'email') {
      console.log('Sending bookmarks via email...')
      await sendBookmarksEmail(bookmarks)
    } else if (config.NOTIFICATION_METHOD === 'discord') {
      console.log('Sending bookmarks via Discord...')
      await sendBookmarksDiscord(bookmarks)
    }

    console.log(
      `Successfully sent ${bookmarks.length} bookmarks via ${config.NOTIFICATION_METHOD}`
    )
    console.log('=== BOOKMARK NOTIFICATION PROCESS COMPLETED ===')
  } catch (error) {
    console.error('=== ERROR IN BOOKMARK NOTIFICATION PROCESS ===')
    console.error('Error sending notification:', error)
    console.error(
      'Stack trace:',
      error instanceof Error ? error.stack : 'No stack trace available'
    )
    console.error('=== END OF ERROR REPORT ===')
  }
}

// Start the scheduler
export function startScheduler() {
  const cronExpression = cronExpressions[config.NOTIFICATION_FREQUENCY]

  if (!cronExpression) {
    throw new Error(
      `Invalid notification frequency: ${config.NOTIFICATION_FREQUENCY}`
    )
  }

  console.log(
    `Scheduler started with ${config.NOTIFICATION_FREQUENCY} frequency (${cronExpression})`
  )

  // Schedule the job using node-cron
  cron.schedule(cronExpression, sendNotification)
}

// Trigger an immediate send (for testing)
export async function sendImmediate() {
  console.log('Triggering immediate notification send')
  await sendNotification()
}
