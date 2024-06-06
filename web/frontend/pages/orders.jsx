import {
	Card,
	Page,
	Layout,
	TextContainer,
	Text,
	IndexTable,
	Badge,
	useIndexResourceState,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '../hooks';

export default function Orders() {
	const { t } = useTranslation();
	const [orders, setOrders] = useState([]);
	const fetch = useAuthenticatedFetch();

	const resourceName = {
		singular: 'order',
		plural: 'orders',
	};

	const { selectedResources, allResourcesSelected, handleSelectionChange } =
		useIndexResourceState(orders);

	const rowMarkup = orders?.map(
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
					{customer.first_name} {customer.last_name}{' '}
				</IndexTable.Cell>
				<IndexTable.Cell>{contact_email}</IndexTable.Cell>
				<IndexTable.Cell>{total_price}</IndexTable.Cell>
				<IndexTable.Cell>{financial_status}</IndexTable.Cell>
				<IndexTable.Cell>{tags}</IndexTable.Cell>
			</IndexTable.Row>
		)
	);

	async function fetchOrders() {
		try {
			let request = await fetch('/api/orders');
			let ordersResponse = await request.json();
			setOrders(ordersResponse?.data);
			console.log(ordersResponse?.data);
		} catch (err) {
			console.log({ err });
		}
	}

	useEffect(() => {
		fetchOrders();
	}, []);

	return (
		<Page>
			<TitleBar
				title={t('Search Orders')}
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
				<IndexTable
					resourceName={resourceName}
					itemCount={orders.length}
					selectedItemsCount={
						allResourcesSelected ? 'All' : selectedResources.length
					}
					onSelectionChange={handleSelectionChange}
					headings={[
						{ title: 'Order' },
						{ title: 'Customer Name' },
						{ title: 'Customer email' },
						{ title: 'Total', alignment: 'end' },
						{ title: 'Payment status' },
						{ title: 'Tags' },
					]}
					hasBulkActions={false}
				>
					{rowMarkup}
				</IndexTable>
			</div>
		</Page>
	);
}
