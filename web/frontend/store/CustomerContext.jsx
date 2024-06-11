import React, { createContext, useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '../hooks';
export const CustomersContext = createContext();

const CustomerContext = ({ children }) => {
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);
	const fetch = useAuthenticatedFetch();

	async function fetchCustomers() {
		setLoading(true); // Ensure loading state is set at the start
		try {
			let response = await fetch('/api/customers');

			// Check if response is okay
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			// Log raw response
			let textResponse = await response.text();
			console.log({ textResponse });

			// Try to parse JSON
			let customersResponse = JSON.parse(textResponse);
			console.log({ customersResponse });

			setCustomers(customersResponse);
		} catch (err) {
			console.log('Error:', err.message);
		} finally {
			setLoading(false);
		}
	}

	async function fetchBadCustomerTarget() {
		try {
			let request = await fetch('/api/customers/badCustomerTarget');
			let customersResponse = await request.json();
			console.log({ customersResponse });
		} catch (err) {
			console.log(err.message);
		}
	}
	useEffect(() => {
		fetchCustomers();
		fetchBadCustomerTarget();
	}, []);

	const value = {
		customers,
		setCustomers,
		loading,
		setLoading,
	};
	return (
		<CustomersContext.Provider value={value}>
			{children}
		</CustomersContext.Provider>
	);
};

export default CustomerContext;
