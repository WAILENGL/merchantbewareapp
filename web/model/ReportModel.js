import mongoose from 'mongoose';

const { Schema } = mongoose;

const repotSchema = new Schema(
	{
		id: Number,
		email: String,
		reason: String,
		content: String,
	},
	{ timeStamp: true }
);

export const ReportModel = mongoose.model('report', repotSchema);
