import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

// Define configuration schema with validation
const ConfigSchema = z.object({
  // Hoarder API
  HOARDER_API_KEY: z.string().min(1, 'Hoarder API key is required'),
  HOARDER_SERVER_URL: z.string().default('https://api.hoarder.app'),

  // Notification settings
  NOTIFICATION_METHOD: z.enum(['email', 'discord', 'mattermost', 'rss']),
  NOTIFICATION_FREQUENCY: z.enum(['daily', 'weekly', 'monthly']),
  BOOKMARKS_COUNT: z.coerce.number().int().positive(),
  SPECIFIC_LIST_ID: z.string().optional(),
  ONLY_UNARCHIVED: z.coerce.boolean().default(false),
  TIMEZONE: z.string().default('UTC'),
  TIME_TO_SEND: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default('09:00'),

  // Email configuration
  EMAIL_SERVICE: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_RECIPIENT: z.string().optional(),

  // Discord configuration
  DISCORD_BOT_TOKEN: z.string().optional(),
  DISCORD_CHANNEL_ID: z.string().optional(),

  // Mattermost configuration
  MATTERMOST_WEBHOOK_URL: z.string().optional(),
  MATTERMOST_CHANNEL: z.string().optional(),
});

// Create config object and validate based on notification method
function validateConfig() {
  try {
    const config = ConfigSchema.parse(process.env)

    // Additional validation based on notification method
    if (config.NOTIFICATION_METHOD === 'email') {
      if (
        !config.EMAIL_SERVICE ||
        !config.EMAIL_USER ||
        !config.EMAIL_PASS ||
        !config.EMAIL_RECIPIENT
      ) {
        throw new Error('Email configuration is incomplete')
      }
    } else if (config.NOTIFICATION_METHOD === 'discord') {
      if (!config.DISCORD_BOT_TOKEN || !config.DISCORD_CHANNEL_ID) {
        throw new Error('Discord configuration is incomplete')
      }
    } else if (config.NOTIFICATION_METHOD === 'mattermost') {
      if (!config.MATTERMOST_WEBHOOK_URL) {
        throw new Error(
          'Mattermost webhook URL is required for Mattermost notifications'
        )
      }
    }

    return config
  } catch (error) {
    console.error('Configuration validation failed:', error)
    process.exit(1)
  }
}

export const config = validateConfig()
