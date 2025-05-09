import mongoose from "mongoose";

const JobPostSchema = new mongoose.Schema(
  {
    posted_by: {
      type: String,
      required: false,
    },
    job_type_id: {
      type: String,
      required: false,
    },
    company_id: {
      type: String,
      required: false,
    },
    company_name: {
      type: String,
      required: false,
    },
    job_title: {
      type: String,
      required: false,
    },
    location_name: {
      type: String,
      required: false,
    },
    is_company_name_hidden: {
      type: Boolean,
      required: false,
    },
    created_date: {
      type: Date,
      required: false,
      default: Date.now,
    },
    job_description: {
      type: String,
      required: false,
      length: 4000,
    },
    job_location_id: {
      type: String,
      required: false,
    },
    salary_range: {
      type: String,
      required: false,
    },
    required_skills: {
      type: [String],
      required: false,
    },
    contact_email: {
      type: String,
      required: false,
    },
    contact_phone: {
      type: String,
      required: false,
    },
    application_deadline: {
      type: Date,
      required: false,
    },
    is_active: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    collection: "job_post",
    timestamps: true,
  }
);

const JobPost = mongoose.model("JobPost", JobPostSchema);

export default JobPost;
