import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema(
  {
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAccount",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    cover_letter: {
      type: String,
      required: false,
    },
    resume_url: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "interviewed", "accepted", "rejected"],
      default: "pending",
    },
    applied_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "job_applications",
    timestamps: true,
  }
);

const JobApplication = mongoose.model("JobApplication", JobApplicationSchema);

export default JobApplication; 