import React, { useState, useEffect } from 'react';
import {
	Card,
	TextContainer,
	Text,
	Link,
	Page,
	TextField,
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks';

export default function CustomerItemCard({ customer }) {
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
						Reported by {report?.shopName}
					</TextContainer>
				</div>
			</Card.Section>
			<Card.Section title="Reports" subdued>
				<TextContainer>
					<p>Reason for Report: {report?.reason}</p>

					<p>{report?.content}</p>
					<Text>
						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								gap: '8px',
							}}
						>
							{notes ? (
								<Link
									url="/edit?userId=${id}"
									onClick={() => console.log('Edit report')}
								>
									Edit Report
								</Link>
							) : (
								<Link
									url={
										customer?.report
											? `/edit?userId=${id}&isEdit=true`
											: `/edit?userId=${id}`
									}
									onClick={() => console.log('Create report')}
								>
									{customer?.report ? 'Edit Report' : 'Create Report'}
								</Link>
							)}
						</div>
					</Text>
				</TextContainer>
			</Card.Section>
		</Card>
	);
}
