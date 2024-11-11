import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  imageUrl: { type: String }, // URL of the image
  description: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  liked: { type: Boolean, default: false }
});

const Post = mongoose.model('Post', postSchema);

export default Post;
