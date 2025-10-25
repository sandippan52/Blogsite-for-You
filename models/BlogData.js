import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  Category: String,
  Title : String,
  Excerpt : String,
  Content: String,
  Image : String
});





  export const BlogData = mongoose.model('BlogData', BlogSchema);


