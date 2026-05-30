import { Schema, Types, model, type InferSchemaType } from 'mongoose';
import { SUPPORTED_LANGUAGES } from '../../../constants/editor.js';

const fileSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255
    },
    content: {
      type: String,
      required: true,
      default: ''
    },
    isEntry: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    roomId: {
      type: Types.ObjectId,
      ref: 'Room',
      required: true,
      unique: true,
      index: true
    },
    language: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      required: true,
      default: 'javascript'
    },
    files: {
      type: [fileSchema],
      default: []
    },
    yDocState: {
      type: Buffer,
      required: false
    },
    lastEditedBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    lastExecutedAt: {
      type: Date,
      required: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

projectSchema.index({ updatedAt: -1 });

export type ProjectDocument = InferSchemaType<typeof projectSchema>;

export const ProjectModel = model('Project', projectSchema);
