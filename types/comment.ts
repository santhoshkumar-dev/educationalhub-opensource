// types/comment.ts
export interface Comment {
  _id: string;
  course: string;
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image_url: string;
  };
  text: string;
  parentComment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentFormData {
  text: string;
  parentCommentId?: string;
}
