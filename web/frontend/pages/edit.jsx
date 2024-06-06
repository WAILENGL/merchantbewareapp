import React, { useState } from 'react';
import {
	Card,
	Page,
	FormLayout,
	Select,
	TextField,
	Button,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticatedFetch } from '../hooks';

export default function ReportForm({ customerEmail, customerAddress }) {
	const { t } = useTranslation();
	const [reason, setReason] = useState('');
	const [notes, setNotes] = useState('');

	const reasons = ['Chargeback', 'Unreasonable', 'Harassment', 'Others'];

	const handleSave = () => {
		// Handle saving the report data
		console.log('Report saved');
	};

	const handleCancel = () => {
		// Handle cancel action
		console.log('Report canceled');
	};

	const handleDelete = () => {
		// Handle cancel action
		console.log('Report deleted');
	};

	return (
		<Page>
			<TitleBar title={t('Bad Customer Report')} />
			<Card sectioned>
				<FormLayout>
					<TextField label="Customer Email" value={customerEmail} readOnly />
					<TextField
						label="Customer Address"
						value={customerAddress}
						readOnly
					/>

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
