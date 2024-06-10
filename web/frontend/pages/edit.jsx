import React, { useState, useEffect, useCallback } from 'react';
import {
	Card,
	Page,
	FormLayout,
	Select,
	TextField,
	Button,
	TextContainer,
	Frame,
	Toast,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedFetch } from '../hooks';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ReportForm({ customerEmail, customerAddress }) {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [notes, setNotes] = useState('');
	const [customerInfo, setCustomerInfo] = useState({});
	let [searchParams, setSearchParams] = useSearchParams();
	const reasons = [
		'Chargeback',
		'Excessive Refunds',
		'Unreasonable',
		'Harassment',
		'Others',
	];
	const fetch = useAuthenticatedFetch();
	const [reason, setReason] = useState('Chargeback');
	const [toastActive, setToastActive] = useState(false);
	const [toastMessage, setToastMessage] = useState('');
	const toastDuration = 2000; // Duration in milliseconds

	const userId = searchParams.get('userId');
	const isEdit = searchParams.get('isEdit');

	const handleSave = async () => {
		try {
			const updateData = await fetch(`/api/customer/report/${userId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					reason: reason,
					content: notes,
				}),
			});
			if (updateData.ok) {
				setToastMessage('Report saved successfully');
				setToastActive(true);
			} else {
				console.error('Failed to save report');
			}
		} catch (err) {
			console.log(err);
		}
	};

	const handleDelete = async () => {
		try {
			const DeletedData = await fetch(
				`/api/customers/report/${customerInfo?.report?.id}`,
				{
					method: 'DELETE',
				}
			);
			if (DeletedData.ok) {
				setToastMessage('Report deleted successfully');
				setToastActive(true);
			} else {
				console.error('Failed to delete report');
			}
		} catch (err) {
			console.log(err);
		}
	};

	const handleUpdate = async () => {
		try {
			const updateData = await fetch(
				`/api/customers/report/${customerInfo?.report?._id}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						content: notes,
						reason: reason,
					}),
				}
			);
			if (updateData.ok) {
				setToastMessage('Report updated successfully');
				setToastActive(true);
			} else {
				console.error('Failed to update report');
			}
		} catch (err) {
			console.log(err);
		}
	};

	const editValue = isEdit === 'true';

	const handleCancel = () => {
		navigate('/customers');
	};

	async function fetchCustomers() {
		try {
			let request = await fetch(`/api/customer/singleCustomer/${userId}`);
			let customerResponse = await request.json();
			console.log({ customerResponse });
			setCustomerInfo(customerResponse);
			setReason(
				customerResponse?.report
					? customerResponse?.report?.reason
					: 'Chargeback'
			);
			setNotes(customerResponse?.report?.content);
		} catch (err) {
			console.log({ err });
		}
	}

	const toggleToastActive = useCallback(() => {
		setToastActive((active) => !active);
		setTimeout(() => {
			navigate('/customers');
		}, 100); // Delay to ensure Toast is dismissed before navigation
	}, [navigate]);

	useEffect(() => {
		fetchCustomers();
	}, [userId]);

	const toastMarkup = toastActive ? (
		<Toast
			content={toastMessage}
			onDismiss={toggleToastActive}
			duration={toastDuration}
		/>
	) : null;

	return (
		<Frame>
			<Page>
				<TitleBar title={t('Bad Customer Report')} />
				<Card sectioned>
					<FormLayout>
						<TextContainer>
							<b>Customer Name:</b> {customerInfo?.first_name}{' '}
							{customerInfo?.last_name}
						</TextContainer>
						<TextContainer>
							<b>Customer Email:</b> {customerInfo?.email}
						</TextContainer>

						<TextContainer>
							<b>Customer Address: </b>
							{customerInfo?.addresses && customerInfo.addresses.length > 0 ? (
								<>
									{customerInfo.addresses[0].address1}{' '}
									{customerInfo.addresses[0].address2}{' '}
									{customerInfo.addresses[0].province_code}{' '}
									{customerInfo.addresses[0].zip}{' '}
									{customerInfo.addresses[0].country}
								</>
							) : (
								<span>No address available</span>
							)}
						</TextContainer>

						<Select
							value={reason}
							label="Reason for report"
							options={reasons.map((reason) => ({
								label: reason,
								value: reason,
							}))}
							onChange={setReason}
						/>
						<TextField
							label="Notes"
							placeholder="Enter notes here"
							multiline={4}
							value={notes}
							onChange={setNotes}
						/>
						<FormLayout.Group>
							{editValue && (
								<div style={{ flex: 1 }}>
									<Button secondary onClick={handleDelete}>
										Delete Report
									</Button>
								</div>
							)}

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
								{!editValue ? (
									<Button primary onClick={handleSave}>
										Save
									</Button>
								) : (
									<Button primary onClick={handleUpdate}>
										Update
									</Button>
								)}
							</div>
						</FormLayout.Group>
					</FormLayout>
				</Card>
			</Page>
			{toastMarkup}
		</Frame>
	);
}
