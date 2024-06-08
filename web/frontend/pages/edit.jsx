import React, { useState, useEffect } from 'react';
import {
	Card,
	Page,
	FormLayout,
	Select,
	TextField,
	Button,
	TextContainer,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedFetch } from '../hooks';
import { useSearchParams } from 'react-router-dom';

export default function ReportForm({ customerEmail, customerAddress }) {
	const { t } = useTranslation();
	const [reason, setReason] = useState('Chargeback');
	const [notes, setNotes] = useState('');
	const [customerInfo, setCustomerInfo] = useState({});
	let [searchParams, setSearchParams] = useSearchParams();
	const reasons = ['Chargeback', 'Unreasonable', 'Harassment', 'Others'];
	const fetch = useAuthenticatedFetch();

	const userId = searchParams.get('userId');

	const handleSave = async () => {
		try {
			const updateData = await fetch(
				`/api/customer/report/${userId}/${reason}/${notes}`,
				{
					method: 'PUT',
					body: JSON.stringify({
						email: customerInfo?.email,
						first_name: customerInfo?.first_name,
						last_name: customerInfo?.last_name,
						// addresses: customerInfo?.addresses,
						reason: reason,
						content: notes,
					}),
				}
			);
			const result = await updateData.json();
			console.log(result);
		} catch (err) {
			console.log(err);
		}
	};

	console.log('query params', userId);

	const handleCancel = () => {
		// Handle cancel action
		console.log('Report canceled');
	};

	const handleDelete = () => {
		// Handle cancel action
		console.log('Report deleted');
	};

	async function fetchCustomers() {
		try {
			let request = await fetch(`/api/customer/signleCustomer/${userId}`);
			let customerResponse = await request.json();
			console.log({ customerResponse });
			setCustomerInfo(customerResponse);
		} catch (err) {
			console.log({ err });
		}
	}

	useEffect(() => {
		fetchCustomers();
	}, [userId]);

	// const customerAddressFetch = `${
	// 	customerInfo?.addresses[0].address1
	// 		? customerInfo?.addresses[0].address1
	// 		: ''
	// }, ${
	// 	customerInfo?.addresses[0].address2
	// 		? customerInfo?.addresses[0].address2
	// 		: ''
	// },
	// ${customerInfo?.addresses[0].city ? customerInfo?.addresses[0].city : ''}, ${
	// 	customerInfo?.addresses[0].province_code
	// 		? customerInfo?.addresses[0].province_code
	// 		: ''
	// },
	// ${customerInfo?.addresses[0].zip ? customerInfo?.addresses[0].zip : ''}, ${
	// 	customerInfo?.addresses[0].country_code
	// 		? customerInfo?.addresses[0].country_code
	// 		: ''
	// }`;

	return (
		<Page>
			<TitleBar title={t('Bad Customer Report')} />
			<Card sectioned>
				<FormLayout>
					<TextContainer>
						<b>Customer Email:</b> {customerEmail || customerInfo?.email}
					</TextContainer>

					<TextContainer>
						<b>Customer Address:</b>
						{customerAddress}
					</TextContainer>

					<Select
						label="Reason for report"
						options={reasons.map((reason) => ({
							label: reason,
							value: reason,
						}))}
						onChange={setReason}
						value={reason}
					/>
					<TextField
						label="Notes"
						placeholder="Enter notes here"
						multiline={4}
						value={notes}
						onChange={setNotes}
					/>
					<FormLayout.Group>
						<div style={{ flex: 1 }}>
							<Button secondary onClick={handleDelete}>
								Delete Report
							</Button>
						</div>

						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								width: '100%',
							}}
						>
							<Button primary onClick={handleCancel} destructive>
								Cancel
							</Button>
							<span style={{ margin: '0 8px' }}></span>
							<Button primary onClick={handleSave}>
								Save
							</Button>
						</div>
					</FormLayout.Group>
				</FormLayout>
			</Card>
		</Page>
	);
}
