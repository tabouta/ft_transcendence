// Text length limits for various fields
export const TEXT_LIMITS = {
  // User names
  USER_FIRST_NAME: 50,
  USER_LAST_NAME: 50,
  USER_DESCRIPTION: 500,
  ASSOCIATION_NAME: 100,
  ASSOCIATION_DESCRIPTION: 1000,

  // Pet
  PET_NAME: 50,
  PET_DESCRIPTION: 500,

  // Content
  POST_CONTENT: 2000,
  COMMENT_CONTENT: 500,
  CHAT_MESSAGE: 2000,
} as const;
