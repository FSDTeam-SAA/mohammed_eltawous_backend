import mongoose from 'mongoose';

const CmsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Type is required'],
      trim: true,
      index: true
    },
    title: {
      type: String,
      trim: true
    },
    // Tiptap rich text content stored as JSON
    richText: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    // Plain text version for search/preview
    plainText: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
CmsSchema.index({ type: 1, isActive: 1 });
CmsSchema.index({ createdAt: -1 });

const Cms = mongoose.model('Cms', CmsSchema);
export default Cms;
