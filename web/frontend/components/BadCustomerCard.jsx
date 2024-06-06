import React from 'react';
import { Card, Button, TextContainer, Text, Link } from '@shopify/polaris';

export default function BadCustomerItemCard({ customer }) {
	const { first_name, last_name, email, addresses } = customer;

	return (
		<Card>
			<Card.Section>
				<TextContainer>
					{`${first_name} ${last_name}`} <br />
					{email}
					<br />
					{addresses && addresses[0] && (
						<>
							{addresses[0].address1}, {addresses[0].address2},{' '}
							{addresses[0].city}, {addresses[0].province_code},{' '}
							{addresses[0].zip}, {addresses[0].country_code}
						</>
					)}
					<p>Reason for Report: Chargeback</p>
				</TextContainer>
			</Card.Section>
			<Card.Section title="Notes" subdued>
				<TextContainer>
									{/* Replace 'Notes will be displayed here' with the actual notes */}
					<p>Notes will be displayed here</p>
					<br></br>

					<Text>
						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								gap: '8px',
							}}
						>
							<Link url="/edit" onClick={() => console.log('Edit report')}>
								Edit Report
							</Link>
							|
							<a href="#" onClick={() => console.log('Delete report')}>
								Delete Report
							</a>
						</div>
					</Text>
				</TextContainer>
			</Card.Section>
		</Card>
	);
}
