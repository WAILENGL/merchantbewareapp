import React, { useState, useEffect } from 'react';
import { Page, TextField, Card } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedFetch } from '../hooks';
import BadCustomerItemCard from '../components/BadCustomerCard';

export default function badCustomers() {
	const { t } = useTranslation();
	const [customers, setCustomers] = useState([]);
	const [filteredCustomers, setFilteredCustomers] = useState([]);
	const fetch = useAuthenticatedFetch();

	const [searchQuery, setSearchQuery] = useState('');

	const handleSearchChange = (value) => {
		setSearchQuery(value);
	};

	const filterCustomers = (query) => {
		const lowercasedQuery = query.toLowerCase();
		return customers.filter((customer) => {
			const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
			const email = customer.email.toLowerCase();
			const address = customer.addresses && customer.addresses[0] 
				? `${customer.addresses[0].address1} ${customer.addresses[0].address2} ${customer.addresses[0].city} ${customer.addresses[0].province_code} ${customer.addresses[0].zip} ${customer.addresses[0].country_code}`.toLowerCase() 
				: '';
			const report = customer.report && customer.report.reason 
				? `${customer.report.reason} ${customer.report.content}`.toLowerCase() 
				: '';
			return fullName.includes(lowercasedQuery) || email.includes(lowercasedQuery) || address.includes(lowercasedQuery) || report.includes(lowercasedQuery);
		});
	};

	async function fetchCustomers() {
		try {
			let request = await fetch('/api/customers/badcustomerDb');
			let customersResponse = await request.json();
			console.log({ customersResponse });
			setCustomers(customersResponse);
			setFilteredCustomers(customersResponse); // Initially, display all customers
		} catch (err) {
			console.log({ err });
		}
	}

	useEffect(() => {
		fetchCustomers();
	}, []);

	useEffect(() => {
		setFilteredCustomers(filterCustomers(searchQuery));
	}, [searchQuery, customers]);

	return (
		<Page>
			<TitleBar title={t('Search MerchantBeware Database')} />
			<Card sectioned>
				<TextField
					value={searchQuery}
					onChange={handleSearchChange}
					placeholder="Search MerchantBeware Database"
				/>
			</Card>
			{filteredCustomers?.map((customer) => (
				<BadCustomerItemCard key={customer.id} customer={customer} />
			))}
		</Page>
	);
}
