// post.ts - Type definition for Posts

export interface Post {
    _id?: string;       // Optional, since it will be assigned by MongoDB
    title: string;      // The title of the post
    content: string;    // The content of the post
    tags: string[];     // An array of tags for the post
    createdAt?: string; // Optional, timestamp for when the post was created
    updatedAt?: string; // Optional, timestamp for when the post was last updated
    published?: boolean; // Optional, indicates if the post is published
  }
  