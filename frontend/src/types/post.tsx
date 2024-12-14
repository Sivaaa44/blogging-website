export interface Post {
    _id?: string;       // Optional, assigned by MongoDB
    title: string;      // The title of the post
    content: string;    // The content of the post
    tags: string[];     // An array of tags for the post
    author: Author;     // The author of the post
    createdAt?: string; // Optional, timestamp for when the post was created
    updatedAt?: string; // Optional, timestamp for when the post was last updated
    published: boolean; // Indicates if the post is published
  }
  
export interface Author {
    id: string;        // Unique identifier for the author
    username: string;  // Display name of the author
  }
  