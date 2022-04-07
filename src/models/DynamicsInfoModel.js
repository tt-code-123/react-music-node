/* 
  操作dynamics_info集合
*/
const mongoose = require('mongoose')

// 描述文档结构
const DynamicSchema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  dynamic_content: { type: String, required: true },       // 动态内容
  user_id: { type: mongoose.Schema.ObjectId, required: true },  // 用户Id
  image_file: { type: [String], required: true },     // 图片
  release_time: { type: String, required: true },   // 发布时间       
})

// // 定义Model 操作集合
const DynamicModel = mongoose.model("Dynamics", DynamicSchema, "dynamics_info")

module.exports = DynamicModel