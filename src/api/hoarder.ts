import { config } from '../utils/config'

// Define interfaces based on Hoarder API
interface Bookmark {
  id: string
  url: string
  title: string
  description: string
  tags: string[]
  created_at: string
  updated_at: string
}

interface List {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

// API base URL and headers
const API_BASE = config.HOARDER_SERVER_URL
const headers = {
  Authorization: `Bearer ${config.HOARDER_API_KEY}`,
  'Content-Type': 'application/json'
}

// Helper function to construct API paths
function constructApiPath(path: string): string {
  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE
  const apiPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${apiPath}`
}

// Get all bookmarks
export async function getAllBookmarks(): Promise<Bookmark[]> {
  try {
    const fullPath = constructApiPath('/api/v1/bookmarks')
    console.log(`Fetching bookmarks from: ${fullPath}`)
    const response = await fetch(fullPath, { headers })

    if (!response.ok) {
      throw new Error(`Failed to fetch bookmarks: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched bookmarks from: ${fullPath}`)

    // Check if the response has a bookmarks array as per v1 API
    if (data.bookmarks && Array.isArray(data.bookmarks)) {
      return data.bookmarks.map((bookmark: any) => {
        const content = bookmark.content || {}

        return {
          id: bookmark.id || '',
          url: content.url || bookmark.url || bookmark.link || '',
          title:
            content.title ||
            bookmark.title ||
            bookmark.name ||
            'Untitled Bookmark',
          description:
            content.description ||
            bookmark.summary ||
            bookmark.description ||
            bookmark.note ||
            '',
          tags: bookmark.tags
            ? bookmark.tags.map((tag: any) =>
                typeof tag === 'string' ? tag : tag.name || ''
              )
            : [],
          created_at: bookmark.createdAt || bookmark.created_at || '',
          updated_at: bookmark.modifiedAt || bookmark.updated_at || ''
        }
      })
    }

    if (data.data && Array.isArray(data.data)) {
      return data.data
    }

    console.log('Unexpected API response format:', data)
    return []
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    throw error
  }
}

// Get all lists
export async function getAllLists(): Promise<List[]> {
  try {
    const fullPath = constructApiPath('/api/v1/lists')
    console.log(`Fetching lists from: ${fullPath}`)
    const response = await fetch(fullPath, { headers })

    if (!response.ok) {
      throw new Error(`Failed to fetch lists: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched lists from: ${fullPath}`)

    if (data.lists && Array.isArray(data.lists)) {
      return data.lists.map((list: any) => ({
        id: list.id,
        name: list.name || '',
        description: list.description || '',
        created_at: list.createdAt || '',
        updated_at: list.modifiedAt || ''
      }))
    }

    if (data.data && Array.isArray(data.data)) {
      return data.data
    }

    console.log('Unexpected API response format:', data)
    return []
  } catch (error) {
    console.error('Error fetching lists:', error)
    throw error
  }
}

// Get a single list by ID
export async function getList(listId: string): Promise<List> {
  try {
    const fullPath = constructApiPath(`/api/v1/lists/${listId}`)
    console.log(`Fetching list from: ${fullPath}`)
    const response = await fetch(fullPath, { headers })

    if (!response.ok) {
      throw new Error(`Failed to fetch list: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched list from: ${fullPath}`)

    if (data.list) {
      return {
        id: data.list.id,
        name: data.list.name || '',
        description: data.list.description || '',
        created_at: data.list.createdAt || '',
        updated_at: data.list.modifiedAt || ''
      }
    }

    if (data.data) {
      return data.data
    }

    console.log('Unexpected API response format:', data)
    throw new Error('Unexpected API response format')
  } catch (error) {
    console.error('Error fetching list:', error)
    throw error
  }
}

// Get bookmarks in a specific list
export async function getBookmarksInList(listId: string): Promise<Bookmark[]> {
  try {
    const fullPath = constructApiPath(`/api/v1/lists/${listId}/bookmarks`)
    console.log(`Fetching bookmarks in list from: ${fullPath}`)
    const response = await fetch(fullPath, { headers })

    if (!response.ok) {
      throw new Error(`Failed to fetch bookmarks in list: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched bookmarks in list from: ${fullPath}`)

    if (data.bookmarks && Array.isArray(data.bookmarks)) {
      return data.bookmarks.map((bookmark: any) => {
        const content = bookmark.content || {}

        return {
          id: bookmark.id || '',
          url: content.url || bookmark.url || bookmark.link || '',
          title:
            content.title ||
            bookmark.title ||
            bookmark.name ||
            'Untitled Bookmark',
          description:
            content.description ||
            bookmark.summary ||
            bookmark.description ||
            bookmark.note ||
            '',
          tags: bookmark.tags
            ? bookmark.tags.map((tag: any) =>
                typeof tag === 'string' ? tag : tag.name || ''
              )
            : [],
          created_at: bookmark.createdAt || bookmark.created_at || '',
          updated_at: bookmark.modifiedAt || bookmark.updated_at || ''
        }
      })
    }

    if (data.data && Array.isArray(data.data)) {
      return data.data
    }

    console.log('Unexpected API response format:', data)
    return []
  } catch (error) {
    console.error('Error fetching bookmarks in list:', error)
    throw error
  }
}

// Get random bookmarks (either from all bookmarks or a specific list)
export async function getRandomBookmarks(
  count: number,
  listId?: string
): Promise<Bookmark[]> {
  try {
    const allBookmarks = listId
      ? await getBookmarksInList(listId)
      : await getAllBookmarks()

    if (!allBookmarks.length) {
      console.log('No bookmarks found')
      return []
    }

    // Shuffle and take requested number of bookmarks
    const shuffled = [...allBookmarks].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  } catch (error) {
    console.error('Error getting random bookmarks:', error)
    throw error
  }
}

export type { Bookmark, List }
