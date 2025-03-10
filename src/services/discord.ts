import { Client, GatewayIntentBits, TextChannel } from 'discord.js'
import { config } from '../utils/config'
import type { Bookmark } from '../api/hoarder'

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
})

// Format bookmarks for Discord message
export function formatDiscordMessage(bookmarks: Bookmark[]): string {
  console.log(
    'Formatting Discord message for bookmarks:',
    JSON.stringify(bookmarks, null, 2)
  )

  let message = '# Your Random Bookmarks from Hoarder \n\n'

  if (bookmarks.length === 0) {
    message +=
      'No bookmarks found. Please check your Hoarder API configuration.'
    return message
  }

  bookmarks.forEach((bookmark, index) => {
    const title = bookmark.title || 'Untitled Bookmark'
    const url = bookmark.url || ''

    if (url) {
      message += `**${index + 1}. [${title}](${url})**\n`
    } else {
      message += `**${index + 1}. ${title}**\n`
    }

    if (bookmark.description) {
      message += `> ${bookmark.description}\n\n`
    }

    if (bookmark.tags && bookmark.tags.length > 0) {
      message += '**Tags:** '
      bookmark.tags.forEach(tag => {
        message += `\`${tag}\` `
      })
      message += '\n\n'
    } else {
      message += '\n'
    }

    message += '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n'
  })

  return message
}

// Send Discord message with bookmarks
export async function sendBookmarksDiscord(
  bookmarks: Bookmark[]
): Promise<void> {
  console.log(`Attempting to send ${bookmarks.length} bookmarks to Discord`)

  if (!client.isReady()) {
    console.log('Discord client not ready, attempting to login...')
    await client.login(config.DISCORD_BOT_TOKEN)
  }

  try {
    if (!config.DISCORD_CHANNEL_ID) {
      throw new Error('Discord channel ID is not defined')
    }

    console.log(
      `Fetching Discord channel with ID: ${config.DISCORD_CHANNEL_ID}`
    )
    const channel = (await client.channels.fetch(
      config.DISCORD_CHANNEL_ID
    )) as TextChannel

    if (!channel || !channel.isTextBased()) {
      throw new Error('Invalid Discord channel or not a text channel')
    }

    console.log(`Successfully fetched channel: ${channel.name}`)

    const message = formatDiscordMessage(bookmarks)
    console.log(
      `Sending message to Discord channel ${channel.name} (${channel.id})`
    )

    const sentMessage = await channel.send(message)
    console.log(
      `Message successfully sent to Discord. Message ID: ${sentMessage.id}`
    )
  } catch (error: any) {
    console.error('Error sending Discord message:', error)
    console.error('Error details:', error.message)
    if (error.code) {
      console.error('Discord error code:', error.code)
    }
    throw error
  }
}

// Initialize Discord client
export async function initDiscordClient(): Promise<void> {
  if (config.NOTIFICATION_METHOD === 'discord') {
    client.once('ready', () => {
      console.log('Discord bot is ready')
    })

    await client.login(config.DISCORD_BOT_TOKEN)
  }
}
