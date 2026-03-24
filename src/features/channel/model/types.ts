export const CHANNEL_REACTION_EMOJIS = ['emoji'] as const;

export type ChannelReactionEmoji = (typeof CHANNEL_REACTION_EMOJIS)[number];

export type ChannelReaction = {
  emoji: ChannelReactionEmoji;
  count: number;
  reacted: boolean;
};

export type ChannelMessage = {
  id: number;
  email: string | null;
  body: string | null;
  createdBy: string | null;
  createdAt: Date;
  isPinned: boolean;
  commentsClosed: boolean;
  reactions: ChannelReaction[];
};

export type ChannelComment = {
  id: number;
  messageId: number;
  parentId: number | null;
  email: string | null;
  body: string | null;
  createdBy: string | null;
  createdAt: Date;
  reactions: ChannelReaction[];
};

export type ChannelCommentNode = ChannelComment & {
  replies: ChannelCommentNode[];
};

export type ChannelThread = ChannelMessage & {
  comments: ChannelCommentNode[];
};
