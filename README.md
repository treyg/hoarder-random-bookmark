# Karakeep Random Bookmark

This application sends random bookmarks from your Karakeep (formerly Hoarder) account to your email, Discord, Mattermost, or RSS feed at scheduled intervals. This is a way to remember and discover all the bookmarks you've saved.
Send from a specific list or all bookmarks, daily, weekly, or monthly.

## Features

- Sends random bookmarks on a daily, weekly, or monthly schedule
- Supports email, Discord, Mattermost, and RSS feed notifications
- Configurable number of bookmarks to send
- Option to select bookmarks from all lists or a specific list
- Option to only send unarchived bookmarks (useful for creating a "to-do list" of active bookmarks)
- Self-host with Docker

## Getting Started

### Obtaining a Karakeep API Key

To use this application, you'll need an API key from your Karakeep account:

1. Log in to your Karakeep account and go to settings
2. Click 'Api keys'
3. Create a new key and copy it
4. This is your `HOARDER_API_KEY` for the application

If you have the [hoarder CLI](https://docs.hoarder.app/command-line/) installed, you can validate that your API key is working by using the following command:

```bash
hoarder --api-key <your-api-key> --server-addr <your-hoarder-server-url> whoami
```

### Configuring Your Hoarder Server URL

Set the `HOARDER_SERVER_URL` environment variable to point to your server:

```
HOARDER_SERVER_URL=https://your-hoarder-instance.com
```

### Getting Your List IDs

If you want to send bookmarks from a specific list, you'll need to get the list ID. You can retrieve your list IDs using a curl command:

```bash
curl -L "<your-hoarder-server-url>/api/v1/lists" \
-H "Accept: application/json" \
-H "Authorization: Bearer <your-api-key>" | jq
```

This will return a JSON response containing all your lists with their IDs. Copy the ID of the list you want to use and set it as the `SPECIFIC_LIST_ID` in your `.env` file.

## Deployment

### 1. Clone the repository

```bash
git clone https://github.com/treyg/hoarder-random-bookmark.git
cd hoarder-random-bookmark
```

### 2. Configure environment variables

Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

- Add your Karakeep API key
- Set your Karakeep Server URL
- Choose notification method (email or discord)
- Set frequency (daily, weekly, monthly)
- Set unarchived to true to ignore archived bookmarks
- Configure your timezone and preferred time for notifications
- Configure notification-specific settings

> If you need to change the server port mapping from `8080`, you can do that in the `docker-compose.yml` file.

### 3. Deploy with Docker Compose

```bash
docker-compose up -d
```

### 4. Verify the deployment

Check the application status:

```bash
docker-compose logs -f
```

Visit http://localhost:8080 to see the application status.

## Development

To install dependencies:

```bash
bun install
```

To run in development mode:

```bash
bun run --watch src/index.ts
```

## Testing

### Testing General Functionality

To trigger an immediate send for testing:

```bash
curl -X POST http://localhost:8080/send-now
```

### Testing Email Specifically

To test the email functionality with a sample bookmark:

```bash
curl http://localhost:8080/test-email
```

This will send a test email with a sample bookmark to your configured email recipient.

### Testing RSS Feed

To access your RSS feed (when configured):

```bash
curl http://localhost:8080/rss/feed
```

Or simply open `http://localhost:8080/rss/feed` in your browser or RSS reader. The feed will update according to your configured schedule (daily, weekly, or monthly).

### Testing Discord Specifically

To test the Discord functionality with a sample bookmark:

```bash
curl http://localhost:8080/test-discord
```

## Scheduling Configuration

### Timezone and Time Settings

By default, notifications are sent at 9:00 AM UTC. You can customize both the time and timezone:

```
# In your .env file
TIMEZONE=America/New_York  # Your local timezone
TIME_TO_SEND=09:00  # Time in 24-hour format (HH:MM)
```

#### Available Options:

- **TIMEZONE**: Any valid IANA timezone name (e.g., `America/New_York`, `Europe/London`, `Asia/Tokyo`)
- **TIME_TO_SEND**: Time in 24-hour format (HH:MM), such as `09:00` for 9 AM or `21:30` for 9:30 PM

These settings apply to all notification frequencies (daily, weekly, monthly). For example:

- With `NOTIFICATION_FREQUENCY=daily` and `TIME_TO_SEND=21:30`, you'll receive notifications every day at 9:30 PM
- With `NOTIFICATION_FREQUENCY=weekly` and `TIME_TO_SEND=18:00`, you'll receive notifications every Monday at 6:00 PM

## Troubleshooting

### Email Notifications

**Important Note for Gmail Users**: Gmail (and many other email providers) no longer allows less secure apps to access your account using your regular password. You must use an App Password instead:

1. Enable 2-factor authentication on your Google account (if not already enabled)
   - Go to your Google Account > Security > 2-Step Verification
2. Go to https://myaccount.google.com/apppasswords
3. Select "App" dropdown and choose "Other (Custom name)"
4. Enter a name like "Hoarder Random Bookmark"
5. Click "Generate"
6. Copy the password that appears
7. Use this generated password as your `EMAIL_PASS` in the `.env` file (not your regular Gmail password)
8. For `EMAIL_SERVICE`, use "gmail"

This is required for security reasons and cannot be bypassed. Similar steps may be required for other email providers like Outlook, Yahoo, etc.

### Discord Notifications

#### Getting a Discord Bot Token:

1. **Create a Discord Application**:

   - Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   - Click on "New Application" in the top right corner
   - Give your application a name (e.g., "Hoarder Random Bookmark") and click "Create"

2. **Create a Bot**:

   - In your application page, click on the "Bot" tab in the left sidebar
   - Click "Add Bot" and confirm by clicking "Yes, do it!"
   - Under the bot's username, you'll see a section for the token
   - Click "Reset Token" and confirm to generate a new token
   - Copy this token - this is your `DISCORD_BOT_TOKEN`
   - Make sure to enable the "Message Content Intent" under "Privileged Gateway Intents"
   - Under "Bot Permissions", select the following permissions:
     - **Text Permissions**:
       - "Send Messages"
       - "Embed Links" (needed for formatted bookmark links)
       - "Read Message History"
       - "View Channels"

- Save your changes

3. **Add Bot to Your Server**:
   - Go to the "OAuth2" tab in the left sidebar
   - Click on "URL Generator"
   - Under "Scopes", select "bot"
   - Copy the generated URL at the bottom of the page
   - Open this URL in your browser and select the server where you want to add the bot
   - Authorize the bot

- Under "Bot Permissions", select the following permissions:
  - **Text Permissions**:
    - "Send Messages"
    - "Embed Links" (needed for formatted bookmark links)
    - "Read Message History"
    - "View Channels"
- Save your changes and copy the generated URL at the bottom of the page
- Open this URL in your browser and select the server where you want to add the bot

#### Getting a Discord Channel ID:

1. **Enable Developer Mode in Discord**:

   - Open Discord
   - Go to User Settings (gear icon near your username)
   - Go to "Advanced" in the left sidebar
   - Enable "Developer Mode"

2. **Get the Channel ID**:
   - Right-click on the channel where you want to receive bookmark notifications
   - Select "Copy ID" from the context menu
   - This is your `DISCORD_CHANNEL_ID`
     > **Note**: You can only copy the channel ID if you have Developer Mode enabled. If you don't:
   - Right click on the channel
   - Select "Copy Link"
   - Paste the link into your browser
   - Look at the URL: https://discord.com/channels/[SERVER-ID]/[CHANNEL-ID]

#### Additional Discord Troubleshooting:

Ensure your bot:

1. Is added to the server where you want to send messages
2. Has permissions to view and send messages in the target channel
3. Has the correct intents enabled (MESSAGE CONTENT)
4. Has all the required permissions:
   - Send Messages
   - Embed Links
   - Read Message History
   - View Channels
5. If messages aren't being sent, check if your bot has permission conflicts with channel-specific permissions or role hierarchy issues

### Mattermost Troubleshooting

Common reasons why the channel field is ignored:

- The webhook integration user does not have permission to post in the target channel.
- The webhook was not created by a system admin.
- The channel name is not correct (should be the channel’s name without the #).
- The webhook is restricted to a specific channel in its Mattermost configuration.

For more information on incoming webhooks, see the [Mattermost documentation](https://developers.mattermost.com/integrate/webhooks/incoming/).
