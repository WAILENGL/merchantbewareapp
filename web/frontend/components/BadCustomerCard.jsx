import React from 'react';
import { Card, Button, TextContainer, Text, Link } from '@shopify/polaris';

export default function BadCustomerItemCard({ customer }) {
	const { first_name, last_name, email, addresses, report } = customer;

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
				</TextContainer>
			</Card.Section>
			<Card.Section title="Reports" subdued>
				<TextContainer>
					<p>Reason for Report: {report?.reason}</p>
					<p>{report?.content}</p>
				</TextContainer>
			</Card.Section>
		</Card>
	);
}
