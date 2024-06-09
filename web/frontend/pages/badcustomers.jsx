import React, { useState, useEffect } from 'react';
import { Page, TextField, Card } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedFetch } from '../hooks';
import BadCustomerItemCard from '../components/BadCustomerCard';

export default function badCustomers() {
	const { t } = useTranslation();
	const [customers, setCustomers] = useState([]);
	const fetch = useAuthenticatedFetch();

	const [searchQuery, setSearchQuery] = useState('');

	const handleSearchChange = () => {
		// Handle cancel action
		console.log('Search Changed');
	};

	async function fetchCustomers() {
		try {
			let request = await fetch('/api/customers/badcustomerDb');
			let customersResponse = await request.json();
			console.log({ customersResponse });
			setCustomers(customersResponse);
		} catch (err) {
			console.log({ err });
		}
	}

	useEffect(() => {
		fetchCustomers();
	}, []);

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
			{customers?.map((customer) => (
				<BadCustomerItemCard key={customer.id} customer={customer} />
			))}
		</Page>
	);
}
