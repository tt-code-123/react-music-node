/* 
  操作comments_info集合
*/
const mongoose = require('mongoose')

// 描述文档结构
const CommentSchema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  content: { type: String, required: true },       // 评论内容
  dynamic_id: { type: mongoose.Schema.ObjectId, required: true },  // 动态Id
  from_id: { type: mongoose.Schema.ObjectId, required: true },     // 评论人ID
  to_id: { type: mongoose.Schema.ObjectId },    // 评论目标人的id
  p_id: { type: mongoose.Schema.ObjectId, required: true }, // 标识Id
  create_time: { type: String, required: true },   // 评论时间       
})

// // 定义Model 操作集合
const CommentModel = mongoose.model("Comments", CommentSchema, "comments_info")

module.exports = CommentModel