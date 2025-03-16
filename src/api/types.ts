// SDK types used internally for API communication
export type SdkBookmark = {
  id: string
  createdAt: string
  modifiedAt: string | null
  title?: string | null
  archived: boolean
  favourited: boolean
  taggingStatus?: 'success' | 'failure' | 'pending' | null
  note?: string | null
  summary?: string | null
  tags: {
    id: string
    name: string
    attachedBy: 'ai' | 'human'
  }[]
  content?: {
    type?: string
    url?: string
    title?: string | null
    description?: string | null
  }
}

export type SdkList = {
  id: string
  name: string
  description?: string
  createdAt: string
  modifiedAt?: string
}

// Simplified types used by our application
export type Bookmark = {
  id: string
  url: string
  title: string
  description: string
  tags: string[]
  created_at: string
  updated_at: string
}

export type List = {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}
