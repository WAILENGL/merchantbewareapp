import React, { useState, useEffect } from 'react';
import {
	Card,
	Page,
	Text,
	IndexTable,
	useIndexResourceState,
	TextField,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedFetch } from '../hooks';

export default function Customers() {
	const { t } = useTranslation();
	const [customers, setCustomers] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const fetch = useAuthenticatedFetch();
	const orders = [
		// Your orders data here
	];

	const resourceName = {
		singular: 'customer',
		plural: 'customers',
	};

	const { selectedResources, allResourcesSelected, handleSelectionChange } =
		useIndexResourceState(orders);

	async function fetchCustomers() {
		try {
			let request = await fetch('/api/customers');
			let customersResponse = await request.json();
			setCustomers(customersResponse?.data);
		} catch (err) {
			console.log({ err });
		}
	}

	useEffect(() => {
		fetchCustomers();
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
				<IndexTable.Cell>
					{addresses && addresses[0] ? addresses[0].address1 : ''},{' '}
					{addresses && addresses[0] ? addresses[0].address2 : ''},{' '}
					{addresses && addresses[0] ? addresses[0].city : ''},{' '}
					{addresses && addresses[0] ? addresses[0].province_code : ''},{' '}
					{addresses && addresses[0] ? addresses[0].zip : ''},{' '}
					{addresses && addresses[0] ? addresses[0].country_code : ''}
				</IndexTable.Cell>
				<IndexTable.Cell>{email}</IndexTable.Cell>
				<IndexTable.Cell>{last_order_name}</IndexTable.Cell>
				<IndexTable.Cell>{total_spent}</IndexTable.Cell>
				<IndexTable.Cell>{tags}</IndexTable.Cell>
			</IndexTable.Row>
		)
	);

	return (
		<Page fullWidth>
			<TitleBar
				title={t('Your Customers')}
				primaryAction={{
					content: t('PageName.primaryAction'),
					onAction: () => console.log('Primary action'),
				}}
				secondaryActions={[
					{
						content: t('PageName.secondaryAction'),
						onAction: () => console.log('Secondary action'),
					},
				]}
			/>
			<div>
				<Card sectioned>
					<TextField
						value={searchQuery}
						onChange={(value) => setSearchQuery(value)}
						label="Search Customers"
						placeholder="Search for customer"
					/>
				</Card>
				<Card>
					<IndexTable
						resourceName={resourceName}
						itemCount={filteredCustomers.length}
						selectedItemsCount={
							allResourcesSelected ? 'All' : selectedResources.length
						}
						onSelectionChange={handleSelectionChange}
						headings={[
							{ title: 'Name' },
							{ title: 'Address' },
							{ title: 'Email' },
							{ title: 'Most Recent Order', alignment: '' },
							{ title: 'Total Spent' },
							{ title: 'Tags' },
						]}
					>
						{rowMarkup}
					</IndexTable>
				</Card>
			</div>
		</Page>
	);
}
