import React from 'react';
import {
	Card,
	TextContainer,
	Text,
	Link,
	Page,
	TextField,
} from '@shopify/polaris';

export default function CustomerItemCard({ customer, currentShopName }) {
	const {
		id,
		first_name,
		last_name,
		email,
		addresses,
		last_order_name,
		total_spent,
		tags,
		notes,
		report,
	} = customer;

	const renderReport = () => {
		if (report && report.shopName === currentShopName) {
			return (
				<>
					<b>Report</b>
					<br />
					<b>Reason for Report:</b> {report?.reason}
					<br />
					<b>Your Report:</b>
					<br />
					{report?.content}
					<Text>
						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								gap: '8px',
							}}
						>
							<Link
								url={`/edit?userId=${id}&isEdit=true`}
								onClick={() => console.log('Edit report')}
							>
								Edit Report
							</Link>
						</div>
					</Text>
				</>
			);
		} else {
			return (
				<Text>
					No report on customer from this shop
					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '8px',
						}}
					>
						<Link
							url={`/edit?userId=${id}`}
							onClick={() => console.log('Create report')}
						>
							Create Report
						</Link>
					</div>
				</Text>
			);
		}
	};

	return (
		<Card>
			<Card.Section>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<TextContainer>
						{`${first_name} ${last_name}`}
						<br />
						{email}
						<br />
						{addresses && addresses[0] && (
							<>
								{addresses[0].address1}, {addresses[0].address2},{' '}
								{addresses[0].city}, {addresses[0].province_code},{' '}
								{addresses[0].zip}, {addresses[0].country_code}
								<br />
							</>
						)}
					</TextContainer>
					<TextContainer>
						Total Spent: {total_spent}
						<br />
						Tags: {tags}
						<br />
					</TextContainer>
				</div>
			</Card.Section>
			<Card.Section subdued>
				<TextContainer>{renderReport()}</TextContainer>
			</Card.Section>
		</Card>
	);
}
