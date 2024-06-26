import mongoose from 'mongoose';

const { Schema } = mongoose;

const reportSchema = new Schema(
	{
		shopName: String,
		id: Number,
		email: String,
		reason: String,
		content: String,
	},
	{ timeStamp: true }
);

export const ReportModel = mongoose.model('report', reportSchema);
export { reportSchema };
