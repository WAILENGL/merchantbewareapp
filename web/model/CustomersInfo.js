import mongoose from 'mongoose';

const { Schema } = mongoose;

const ReportSchema = new Schema(
	{
		id: Number,
		email: String,
        reason: String,
		content: String,
	},
	{ timeStamp: true }
);


const AddressSchema = new Schema({
  id: Number,
  customer_id: Number,
  first_name: { type: String, default: null },
  last_name: { type: String, default: null },
  company: { type: String, default: null },
  address1: String,
  address2: { type: String, default: null },
  city: String,
  province: String,
  country: String,
  zip: String,
  phone: String,
  name: String,
  province_code: String,
  country_code: String,
  country_name: String,
  default: Boolean
});

const CustomerSchema = new Schema(
	{
		id: Number,
		email: String,
		first_name: String,
		last_name: String,
    addresses: [AddressSchema],
		tags: { type: String, default: '' },
		report: [ReportSchema],

	},
	{ timeStamp: true }
);

export const CustomerModel = mongoose.model('badCustomer', CustomerSchema);