export type ChannelMessage = {
  id: number;
  email: string | null;
  body: string | null;
  createdBy: string | null;
  createdAt: Date;
  isPinned: boolean;
  commentsClosed: boolean;
};

export type ChannelComment = {
  id: number;
  messageId: number;
  parentId: number | null;
  email: string | null;
  body: string | null;
  createdBy: string | null;
  createdAt: Date;
};

export type ChannelCommentNode = ChannelComment & {
  replies: ChannelCommentNode[];
};

export type ChannelThread = ChannelMessage & {
  comments: ChannelCommentNode[];
};
