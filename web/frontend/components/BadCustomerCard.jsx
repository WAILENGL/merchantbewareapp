import React from 'react';
import { Card, Button, TextContainer, Text, Link } from '@shopify/polaris';

export default function BadCustomerItemCard({ customer }) {
	const { first_name, last_name, email, addresses, report } = customer;

	return (
		<Card>
			<Card.Section>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
					</TextContainer>
				</div>
			</Card.Section>
			<Card.Section>
				<TextContainer>
					<b>Reported by:</b> {report?.shopName}
				</TextContainer>
				<TextContainer>
					<p>
						<b>Reason for Report:</b> {report?.reason}
					</p>
					<p>
						<b>Comments</b>
					</p>
					{report?.content}
				</TextContainer>
			</Card.Section>
		</Card>
	);
}
