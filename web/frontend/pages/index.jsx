import React from 'react';
import {
	Page,
	Card,
	Button,
	Layout,
	TextStyle,
	Link,
	Heading,
	TextContainer,
} from '@shopify/polaris';
import { useTranslation } from 'react-i18next';
import { TitleBar } from '@shopify/app-bridge-react';

export default function HomePage() {
	const { t } = useTranslation();

	return (
		<Page>
			<TitleBar title={t('Merchant Beware')} />
			<Layout>
				<Layout.Section>
					<Card sectioned>
						<Heading>Welcome to Merchant Beware</Heading>
						<TextContainer>
							<br />
							Merchant Beware helps you safeguard your store by detecting and
							tagging bad customers based on reports submitted by you and other
							merchants. Keep your business protected and make informed
							decisions with our comprehensive database and tools.
						</TextContainer>
					</Card>
				</Layout.Section>

				<Layout.Section>
					<Heading>Main Features</Heading>
					<Layout>
						<Layout.Section oneThird>
							<Card title="Search Merchant Beware Database" sectioned>
								<p>
									<TextStyle>
										Search the comprehensive database of reports submitted by
										other merchants to identify potentially problematic
										customers.
									</TextStyle>
								</p>
								<br />
								<Button primary url="/badcustomers">
									Search Database
								</Button>
							</Card>
						</Layout.Section>
						<Layout.Section oneThird>
							<Card title="Search Your Customers" sectioned>
								<p>
									<div style={{ marginBottom: '20px' }}>
										<TextStyle>
											Check your own customer base and create, edit or delete
											your reports on problematic customers.
										</TextStyle>
									</div>
								</p>
								<br />
								<Button primary url="/customers">
									Search Your Customers
								</Button>
							</Card>
						</Layout.Section>
						<Layout.Section oneThird>
							<Card title="Search Your Orders" sectioned>
								<p>
									<div style={{ marginBottom: '20px' }}>
										<TextStyle>
											Check your orders and create, edit or delete your reports
											on problematic customers.
										</TextStyle>
									</div>
								</p>
								<br />
								<Button primary url="/orders">
								Search Your Orders
								</Button>
							</Card>
						</Layout.Section>
					</Layout>
				</Layout.Section>

				<Layout.Section>
					<Card title="How It Works" sectioned>
						<p>
							1. <TextStyle variation="strong">Submit Reports:</TextStyle> Share
							your experiences with bad customers by submitting reports on your
							interactions with them.
						</p>
						<br />
						<p>
							2. <TextStyle variation="strong">Database Search:</TextStyle> Use
							the search tools to find information on reported customers,
							protecting your store from potential issues.
						</p>
						<br />
						<p>
							3. <TextStyle variation="strong">Automated Tagging:</TextStyle>{' '}
							Merchant Beware automatically tags the customer or order as "bad
							customer" for easy identification.
						</p>
					</Card>
				</Layout.Section>

				<Layout.Section>
					<Card title="Support" sectioned>
						<p>
							If you have any questions or need assistance, please contact our
							support team at{' '}
							<Link url="mailto:support@merchantbeware.com">
								support@merchantbeware.com
							</Link>
							.
						</p>
					</Card>
				</Layout.Section>

				<Layout.Section>
					<Card sectioned>
						<Heading>
							Protect your business and stay informed with Merchant Beware. Your
							first line of defense against bad customers.
						</Heading>
					</Card>
				</Layout.Section>

				<Layout.Section>
					<Card title="Quick Links" sectioned>
						<p>
							<Link url="/badcustomers">Search Merchant Beware Database</Link>
						</p>
						<p>
							<Link url="/customers">Search Your Customers</Link>
						</p>
						<p>
							<Link url="/edit">Search Your Orders</Link>
						</p>
						<p>
							<Link url="mailto:support@merchantbeware.com">Support</Link>
						</p>
					</Card>
				</Layout.Section>
			</Layout>
		</Page>
	);
}
