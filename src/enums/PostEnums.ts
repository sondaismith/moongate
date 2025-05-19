export enum IconTypes{
    Comment = "comment",
    Reposts = "repost",
    Likes = "like",
    Share = "share",
    Options = "option"
}
export enum PostTypes{
    Text = "text",
    Image = "image",
    Video = "video",
    Quote = "quote",
    Link = "link",
}
export enum MediaType{
    Image = 'image',
    Video = 'video',
}
/**
 * Enum used to indicate what type of Post is being created:
 * A standalone Post, a Reply or a Quote Post.
 */
export enum PostActions{
    Post = 'post',
    Reply = 'reply',
    Quote = 'quote',
    Like = 'like'
}