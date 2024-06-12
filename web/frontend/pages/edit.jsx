import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
	Card,
	Page,
	FormLayout,
	Select,
	TextField,
	Button,
	TextContainer,
	Frame,
	Spinner,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedFetch } from '../hooks';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../store/ShopContext';

export default function ReportForm() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [shop, setShop] = useContext(ShopContext);
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
	const [loading, setLoading] = useState(false);

	const userId = searchParams.get('userId');
	const isEdit = searchParams.get('isEdit');

	const handleSave = async () => {
		setLoading(true);
		try {
			const saveData = await fetch(`/api/customer/report/${userId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					shop: shop?.name,
					reason: reason,
					content: notes,
				}),
			});
			if (saveData.ok) {
				
			} else {
				console.error('Failed to save report');
			}
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
			navigate(-1);
		}
	};

	const handleDelete = async () => {
		setLoading(true);
		try {
			const DeletedData = await fetch(
				`/api/customers/report/${customerInfo?.report?.id}`,
				{
					method: 'DELETE',
				}
			);
			if (DeletedData.ok) {
			
			} else {
				console.error('Failed to delete report');
			}
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
			navigate(-1);
		}
	};

	const handleUpdate = async () => {
		setLoading(true);
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
			
			} else {
				console.error('Failed to update report');
			}
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
			navigate(-1);
		}
	};

	const editValue = isEdit === 'true';

	const handleCancel = () => {
		navigate(-1);
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

	useEffect(() => {
		fetchCustomers();
	}, [userId]);

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
							label="Report"
							placeholder="Write about your customer interaction here"
							multiline={4}
							value={notes}
							onChange={setNotes}
						/>
						<FormLayout.Group>
							{editValue && (
								<div style={{ flex: 1 }}>
									<Button secondary onClick={handleDelete} disabled={loading}>
										{loading ? 'Deleting...' : 'Delete Report'}
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
								<Button
									primary
									onClick={handleCancel}
									destructive
									disabled={loading}
								>
									Cancel
								</Button>
								<span style={{ margin: '0 8px' }}></span>
								{!editValue ? (
									<Button primary onClick={handleSave} disabled={loading}>
										{loading ? 'Saving...' : 'Save'}
									</Button>
								) : (
									<Button primary onClick={handleUpdate} disabled={loading}>
										{loading ? 'Updating...' : 'Update'}
									</Button>
								)}
							</div>
						</FormLayout.Group>
					</FormLayout>
				</Card>
			</Page>
		</Frame>
	);
}
