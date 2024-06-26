import shopify from "../shopify.js";
import { ReportModel } from "../model/ReportModel.js";
import { CustomerModel } from "../model/CustomersInfo.js";

export const badCustomerReportUpdate = async (_req, res) => {
  try {
    const updateReport = await ReportModel.findByIdAndUpdate(
      { _id: _req.params.id },
      { ..._req.body }
    );
    res.status(200).send(updateReport);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

export const badCustomerReportDelete = async (_req, res) => {
  try {
    const session = res.locals.shopify.session;
    const customerId = parseInt(_req.params.id);

    // Remove customer tag
    const customer = new shopify.api.rest.Customer({ session });
    customer.id = customerId;
    customer.tags = ""; // Clear all tags
    await customer.save({ update: true });

    // Fetch orders and remove tags
    const findOrder = await shopify.api.rest.Customer.orders({
      session,
      id: customerId,
    });
    const removeBadTags = findOrder?.orders?.map(async (order) => {
      const orderUpdate = new shopify.api.rest.Order({ session });
      orderUpdate.id = order.id;
      orderUpdate.tags = ""; // Clear all tags
      await orderUpdate.save({ update: true });
    });
    await Promise.all(removeBadTags);

    // Remove customer and report from MongoDB
    await Promise.all([
      CustomerModel.deleteOne({ id: customerId }),
      ReportModel.deleteOne({ id: customerId }),
    ]);

    res.status(200).send("Deleted");
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const badCustomerReportSave = async (_req, res) => {
  try {
    const customerId = parseInt(_req.params.id);

    // Fetch customer information from Shopify
    const customerInfo = await shopify.api.rest.Customer.find({
      session: res.locals.shopify.session,
      id: customerId,
    });

    // Fetch customer orders from Shopify
    const findOrder = await shopify.api.rest.Customer.orders({
      session: res.locals.shopify.session,
      id: customerId,
    });

    // Update customer tags to mark as bad customer
    const customer = new shopify.api.rest.Customer({
      session: res.locals.shopify.session,
    });
    customer.id = customerId;
    customer.tags = "bad customer";
    await customer.save({ update: true });

    // Update tags for bad orders
    const badOrders = findOrder?.orders?.map(async (item) => {
      const orders = new shopify.api.rest.Order({
        session: res.locals.shopify.session,
      });
      orders.id = item?.id;
      orders.tags = "bad customer";
      await orders.save({ update: true });
    });
    await Promise.all(badOrders);

    // Create a new report
    const newReport = new ReportModel({
      shopName: _req.body.shop,
      id: customerId,
      email: customerInfo?.email,
      reason: _req.body.reason,
      content: _req.body.content,
    });
    await newReport.save();

    // Check if the customer exists in MongoDB
    let customerDoc = await CustomerModel.findOne({
      email: customerInfo?.email,
    });

    // If the customer doesn't exist, create a new customer
    if (!customerDoc) {
      customerDoc = new CustomerModel({
        id: customerId,
        email: customerInfo?.email,
        first_name: customerInfo?.first_name,
        last_name: customerInfo?.last_name,
        addresses: customerInfo?.addresses,
        tags: "bad customer",
        reports: [newReport._id], // Add the new report to the reports array
      });
    } else {
      // If the customer exists, push the new report to the existing reports array
      customerDoc.reports.push(newReport._id);
    }

    // Save the updated customer document
    await customerDoc.save();

    res.status(200).send({ message: "Report saved successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(err.code || 500).send(err.message);
  }
};

export const getBadCustomerFromDB = async (_req, res) => {
  try {
    // Fetch all customers and reports from MongoDB
    const [users, reports] = await Promise.all([
      CustomerModel.find(),
      ReportModel.find(),
    ]);

    // Create a map of customer emails with reports
    const customerReportsMap = new Map();
    reports.forEach((report) => {
      customerReportsMap.set(report.email, report);
    });

    // Fetch customers from Shopify
    const session = res.locals.shopify.session;
    const shopifyCustomers = await shopify.api.rest.Customer.all({ session });

    // Check if customer data is available
    if (!shopifyCustomers?.data) {
      return res.status(500).send("Failed to retrieve customers from Shopify");
    }

    // Tag Shopify customers as bad if they have a report in MongoDB
    const mongoUpdateShopify = shopifyCustomers.data.map(async (customer) => {
      const report = customerReportsMap.get(customer.email);
      if (report) {
        try {
          // Tag the customer as "bad customer"
          const customerUpdate = new shopify.api.rest.Customer({ session });
          customerUpdate.id = customer.id;
          customerUpdate.tags = "bad customer";
          await customerUpdate.save({ update: true });

          // Fetch orders for the customer
          const findOrder = await shopify.api.rest.Customer.orders({
            session,
            id: customer.id,
          });

          // Tag the orders as "bad customer"
          const orderUpdatePromises = findOrder?.orders?.map(async (order) => {
            const orderUpdate = new shopify.api.rest.Order({ session });
            orderUpdate.id = order.id;
            orderUpdate.tags = "bad customer";
            await orderUpdate.save({ update: true });
          });

          await Promise.all(orderUpdatePromises);
        } catch (error) {
          console.error(`Error updating customer ID ${customer.id}:`, error);
        }
      }
    });

    await Promise.all(mongoUpdateShopify);

    const merged = await Promise.all(
      users.map(async (user) => {
        try {
          const report = reports.find((r) => r.email === user.email);
          return report ? { ...user?._doc, report: report?._doc } : user._doc;
        } catch (error) {
          console.error(
            `Error merging user with id ${user.id}: ${error.message}`
          );
          return user;
        }
      })
    );

    res.json(merged?.reverse());
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
};

export const customerReportCheck = async (_req, res) => {
  try {
    // Ensure session is available
    const session = res.locals.shopify.session;
    if (!session) {
      return res.status(401).send("Unauthorized: Session is missing");
    }

    // Fetch customers from Shopify
    const customers = await shopify.api.rest.Customer.all({ session });

    // Check if customer data is available
    if (!customers?.data) {
      return res.status(500).send("Failed to retrieve customers");
    }

    // Fetch reports for each customer and tag as bad customer if a report is found
    const customersDataPromise = customers.data.map(async (customer) => {
      try {
        const reportOnDb = await ReportModel.findOne({ id: customer?.id });
        if (reportOnDb) {
          // If a report is found, tag the customer as a bad customer
          const customerUpdate = new shopify.api.rest.Customer({ session });
          customerUpdate.id = customer.id;
          customerUpdate.tags = "bad customer";
          await customerUpdate.save({ update: true });

          return { ...customer, report: reportOnDb, tags: "bad customer" };
        } else {
          return { ...customer, report: null, tags: "" };
        }
      } catch (error) {
        console.error(
          `Error fetching report for customer ID ${customer?.id}:`,
          error
        );
        return { ...customer, report: null, error: error.message, tags: "" };
      }
    });

    const customersData = await Promise.all(customersDataPromise);

    // Send the final data
    setTimeout(() => {
      res.status(200).json(customersData);
    }, 200);
  } catch (err) {
    console.error("Error in /api/customers:", err);
    res.status(500).send("unhandled error");
  }
};

/* export const badCustomerTarget = async (_req, res) => {
	try {
		const customers = await shopify.api.rest.Customer.all({
			session: res.locals.shopify.session,
		});

		const badCustomers = customers?.data?.filter(
			(item) => item?.tags === 'bad customer'
		);

		const customerPromises = badCustomers.map(async (item) => {
			const newCustomer = new CustomerModel({
				id: item.id,
				email: item.email,
				first_name: item.first_name,
				last_name: item.last_name,
				addresses: item.addresses,
				tags: item.tags,
				reports: item.reports,
			});

			try {
				const existingCustomer = await CustomerModel.findOne({
					email: item.email,
				});
				if (!existingCustomer) {
					await newCustomer.save();
					return { message: 'user added', customer: item };
				} else {
					return { message: 'user already exists', customer: item };
				}
			} catch (error) {
				return { message: 'internal error', error: error.message };
			}
		});

		await Promise.all(customerPromises);
		setTimeout(() => {
			res.status(200).json(customers);
		}, 200);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
 */
