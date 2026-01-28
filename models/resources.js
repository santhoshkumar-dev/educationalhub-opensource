const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  link: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String },
  description: { type: String },
});

const resourcesSchema = new mongoose.Schema({
  category: { type: String, required: true },
  resources: [resourceSchema],
});

const Resource =
  mongoose.models.Resource || mongoose.model("Resource", resourcesSchema);

module.exports = Resource;
