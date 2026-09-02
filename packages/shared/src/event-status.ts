export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Unlisted events are reachable by anyone holding the link but excluded from
 * discovery; private events additionally require an invitation token.
 */
export enum EventVisibility {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private',
}
