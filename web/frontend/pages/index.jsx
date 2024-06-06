import {
	Card,
	Page,
	Layout,
	TextContainer,
	Image,
	Stack,
	Link,
	Text,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation, Trans } from 'react-i18next';

import { trophyImage } from '../assets';

import { ProductsCard } from '../components';
import { useAuthenticatedFetch } from '../hooks';
import { useEffect } from 'react';
export default function HomePage() {
	const { t } = useTranslation();

	const fetch = useAuthenticatedFetch();

	async function fetchOrders() {
		try {
			let request = await fetch('/api/customers/badCustomers', {
				method: 'PUT',
				body: JSON.stringify({}),
			});
			let ordersResponse = await request.json();
			// setCustomers(customersResponse?.data);
			console.log('bad customers', ordersResponse);
		} catch (err) {
			console.log({ err });
		}
	}

	async function fetchBadCustomers() {
		try {
			let request = await fetch('/api/customers');
			let ordersResponse = await request.json();

			console.log('negetive customers', ordersResponse);
		} catch (err) {
			console.log({ err: err });
		}
	}

	useEffect(() => {
		fetchOrders();
		fetchBadCustomers();
	}, []);

	return (
		<Page narrowWidth>
			<TitleBar title={t('HomePage.title')} primaryAction={null} />
			<Layout>
				<Layout.Section>
					<Card sectioned>
						<Stack
							wrap={false}
							spacing="extraTight"
							distribution="trailing"
							alignment="center"
						>
							<Stack.Item fill>
								<TextContainer spacing="loose">
									<Text as="h2" variant="headingMd">
										{t('HomePage.heading')}
									</Text>
									<p>
										<Trans
											i18nKey="HomePage.yourAppIsReadyToExplore"
											components={{
												PolarisLink: (
													<Link url="https://polaris.shopify.com/" external />
												),
												AdminApiLink: (
													<Link
														url="https://shopify.dev/api/admin-graphql"
														external
													/>
												),
												AppBridgeLink: (
													<Link
														url="https://shopify.dev/apps/tools/app-bridge"
														external
													/>
												),
											}}
										/>
									</p>
									<p>{t('HomePage.startPopulatingYourApp')}</p>
									<p>
										<Trans
											i18nKey="HomePage.learnMore"
											components={{
												ShopifyTutorialLink: (
													<Link
														url="https://shopify.dev/apps/getting-started/add-functionality"
														external
													/>
												),
											}}
										/>
									</p>
								</TextContainer>
							</Stack.Item>
							<Stack.Item>
								<div style={{ padding: '0 20px' }}>
									<Image
										source={trophyImage}
										alt={t('HomePage.trophyAltText')}
										width={120}
									/>
								</div>
							</Stack.Item>
						</Stack>
					</Card>
				</Layout.Section>
				<Layout.Section>
					<ProductsCard />
				</Layout.Section>
			</Layout>
		</Page>
	);
}
