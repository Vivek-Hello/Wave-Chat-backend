import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    content: {
      type: String,
      validate: {
        validator: function (v) {
          return v || this.image;
        },
        message: "Message must have either content or an image",
      },
    },
    image: {
      type: String,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation to ensure either receiver or group is provided
messageSchema.pre("validate", function (next) {
  if (!this.receiver && !this.group) {
    return next(new Error("Message must be sent to either a receiver or a group."));
  }
  next();
});

// Indexes for faster querying
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ group: 1 });

export const Message = mongoose.model("Message", messageSchema);
