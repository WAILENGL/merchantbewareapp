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

export default function Customers() {
	const { t } = useTranslation();
	const [customers, setCustomers] = useState([]);
	const fetch = useAuthenticatedFetch();
	const orders = [
		{
			id: '1020',
			order: '#1020',
			date: 'Jul 20 at 4:34pm',
			customer: 'Jaydon Stanton',
			total: '$969.44',
			paymentStatus: <Badge progress="complete">Paid</Badge>,
			fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
		},
		{
			id: '1019',
			order: '#1019',
			date: 'Jul 20 at 3:46pm',
			customer: 'Ruben Westerfelt',
			total: '$701.19',
			paymentStatus: <Badge progress="partiallyComplete">Partially paid</Badge>,
			fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
		},
		{
			id: '1018',
			order: '#1018',
			date: 'Jul 20 at 3.44pm',
			customer: 'Leo Carder',
			total: '$798.24',
			paymentStatus: <Badge progress="complete">Paid</Badge>,
			fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
		},
	];

	const resourceName = {
		singular: 'customers',
		plural: 'customers',
	};

	const { selectedResources, allResourcesSelected, handleSelectionChange } =
		useIndexResourceState(orders);

	const rowMarkup = customers?.map(
		({ id, first_name, last_name, email, addresses, last_order_name, total_spent, tags }, index) => (
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
					{' '}
					{addresses && addresses[0] ? addresses[0].address1 : ''},{' '}
					{addresses && addresses[0] ? addresses[0].address2 : ''}
					{addresses && addresses[0] ? addresses[0].country : ''}
				</IndexTable.Cell>
				<IndexTable.Cell>{email}</IndexTable.Cell>
				<IndexTable.Cell>{last_order_name} </IndexTable.Cell>
				<IndexTable.Cell>{total_spent}</IndexTable.Cell>
				<IndexTable.Cell>{tags}</IndexTable.Cell>
			</IndexTable.Row>
		)
	);

	async function fetchCustomers() {
		try {
			let request = await fetch('/api/customers');
			let customersResponse = await request.json();
			setCustomers(customersResponse?.data);
			console.log(customersResponse?.data);
		} catch (err) {
			console.log({ err });
		}
	}

	useEffect(() => {
		fetchCustomers();
	}, []);

	return (
		<Page>
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
				<IndexTable
					resourceName={resourceName}
					itemCount={orders.length}
					selectedItemsCount={
						allResourcesSelected ? 'All' : selectedResources.length
					}
					onSelectionChange={handleSelectionChange}
					headings={[
						{ title: 'Name' },
						{ title: 'address' },
						{ title: 'email' },
						{ title: 'Orders', alignment: 'end' },
						{ title: 'Total Spent' },
						{ title: 'Tags' },
					]}
				>
					{rowMarkup}
				</IndexTable>
			</div>
		</Page>
	);
}
