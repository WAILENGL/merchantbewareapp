import React, { useState, useEffect } from 'react';
import {
	Card,
	Page,
	Layout,
	TextContainer,
	Text,
	IndexTable,
	Badge,
	useIndexResourceState,
	TextField,
	Link,
	Button,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedFetch } from '../hooks';

export default function Orders() {
	const { t } = useTranslation();
	const [orders, setOrders] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const fetch = useAuthenticatedFetch();

	const resourceName = {
		singular: 'order',
		plural: 'orders',
	};

	const { selectedResources, allResourcesSelected, handleSelectionChange } =
		useIndexResourceState(orders);

	async function fetchOrders() {
		try {
			let request = await fetch('/api/orders');
			let ordersResponse = await request.json();
			setOrders(ordersResponse?.data);
		} catch (err) {
			console.log({ err });
		}
	}

	useEffect(() => {
		fetchOrders();
	}, []);

	const filteredOrders = orders.filter((order) => {
		const searchString = searchQuery.toLowerCase();
		return (
			order.order_number.toString().toLowerCase().includes(searchString) ||
			(order.customer &&
				`${order.customer.first_name} ${order.customer.last_name}`
					.toLowerCase()
					.includes(searchString)) ||
			(order.contact_email &&
				order.contact_email.toLowerCase().includes(searchString)) ||
			order.total_price.toLowerCase().includes(searchString) ||
			order.financial_status.toLowerCase().includes(searchString) ||
			order.tags.toLowerCase().includes(searchString)
		);
	});

	const rowMarkup = filteredOrders.map(
		(
			{
				id,
				order_number,
				contact_email,
				total_price,
				customer,
				addresses,
				financial_status,
				tags,
				notes,
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
						{order_number}
					</Text>
				</IndexTable.Cell>
				<IndexTable.Cell>
					{customer && `${customer.first_name} ${customer.last_name}`}
				</IndexTable.Cell>
				<IndexTable.Cell>{contact_email}</IndexTable.Cell>
				<IndexTable.Cell>{total_price}</IndexTable.Cell>
				<IndexTable.Cell>{financial_status}</IndexTable.Cell>
				<IndexTable.Cell>{tags}</IndexTable.Cell>
				<IndexTable.Cell>
					<Link to="/edit">
						<Button>
							{notes && notes.length > 0 ? 'Edit Report' : 'Create Report'}
						</Button>
					</Link>
				</IndexTable.Cell>
			</IndexTable.Row>
		)
	);

	return (
		<Page fullWidth>
			<TitleBar title={t('Search Orders')} />
			<div>
				<Card sectioned>
					<TextField
						value={searchQuery}
						onChange={setSearchQuery}
						label="Search Orders"
						placeholder="Search by order number, customer name, email, total, status, or tags"
					/>
				</Card>
				<Card>
					<IndexTable
						resourceName={resourceName}
						itemCount={filteredOrders.length}
						selectedItemsCount={
							allResourcesSelected ? 'All' : selectedResources.length
						}
						onSelectionChange={handleSelectionChange}
						headings={[
							{ title: 'Order' },
							{ title: 'Customer Name' },
							{ title: 'Customer email' },
							{ title: 'Order Total' },
							{ title: 'Payment status' },
							{ title: 'Tags' },
							{ title: '' },
						]}
					>
						{rowMarkup}
					</IndexTable>
				</Card>
			</div>
		</Page>
	);
}
