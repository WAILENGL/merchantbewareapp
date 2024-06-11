import React, { useState, useEffect } from 'react';
import {
	Card,
	Page,
	Text,
	IndexTable,
	useIndexResourceState,
	TextField,
	Spinner,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedFetch } from '../hooks';
import CustomerItemCard from '../components/CustomerCard';
import { useNavigate } from 'react-router-dom';

export default function Customers() {
	const { t } = useTranslation();
	const [customers, setCustomers] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);
	const fetch = useAuthenticatedFetch();
	const orders = [];
	const navigate = useNavigate();
	const resourceName = {
		singular: 'customer',
		plural: 'customers',
	};

	const { selectedResources, allResourcesSelected } =
		useIndexResourceState(orders);

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
	async function fetchShopInfo() {
		try {
			let request = await fetch('/api/shop');
			let shopResponse = await request.json();
			console.log({ shopResponse });
		} catch (err) {
			console.log(err.message);
		}
	}

	useEffect(() => {
		fetchCustomers();
		fetchBadCustomerTarget();
		fetchShopInfo();
	}, []);

	const filteredCustomers = customers.filter((customer) => {
		const fullName = `${customer.first_name} ${customer.last_name}`;
		const searchString = searchQuery.toLowerCase();
		return (
			fullName.toLowerCase().includes(searchString) ||
			(customer.email && customer.email.toLowerCase().includes(searchString)) ||
			(customer.addresses &&
				customer.addresses.some(
					(address) =>
						(address &&
							address.address1 &&
							address.address1.toLowerCase().includes(searchString)) ||
						(address.address2 &&
							address.address2.toLowerCase().includes(searchString)) ||
						(address.city &&
							address.city.toLowerCase().includes(searchString)) ||
						(address.province_code &&
							address.province_code.toLowerCase().includes(searchString)) ||
						(address.zip && address.zip.toLowerCase().includes(searchString)) ||
						(address.country_code &&
							address.country_code.toLowerCase().includes(searchString))
				)) ||
			(customer.tags && customer.tags.toLowerCase().includes(searchString)) ||
			(customer.last_order_name &&
				customer.last_order_name.toLowerCase().includes(searchString))
		);
	});

	const rowMarkup = filteredCustomers.map(
		(
			{
				id,
				first_name,
				last_name,
				email,
				addresses,
				last_order_name,
				total_spent,
				tags,
			},
			index
		) => (
			<IndexTable.Row
				id={id}
				key={id}
				selected={selectedResources.includes(id)}
				position={index}
			>
				<IndexTable.Cell>
					<Text variant="bodyMd" fontWeight="bold" as="span">
						{first_name} {last_name}
					</Text>
				</IndexTable.Cell>
				{/* Other cells */}
			</IndexTable.Row>
		)
	);

	return (
		<Page fullWidth>
			<TitleBar title={t('Your Customers')} />

			<div>
				<Card sectioned>
					<TextField
						value={searchQuery}
						onChange={(value) => setSearchQuery(value)}
						label="Search Customers"
						placeholder="Search for customer"
					/>
				</Card>

				{loading ? (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							marginTop: '20px',
						}}
					>
						<Spinner />
					</div>
				) : (
					<div style={{ marginTop: '20px' }}>
						{filteredCustomers.map((customer) => (
							<CustomerItemCard key={customer.id} customer={customer} />
						))}
					</div>
				)}
			</div>
		</Page>
	);
}
