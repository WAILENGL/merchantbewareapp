import { BrowserRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NavigationMenu } from '@shopify/app-bridge-react';
import CustomerContext from './store/CustomerContext';
import ShopContext from './store/ShopContext';
import Routes from './Routes';

import {
	AppBridgeProvider,
	QueryProvider,
	PolarisProvider,
} from './components';

export default function App() {
	// Any .tsx or .jsx files in /pages will become a route
	// See documentation for <Routes /> for more info
	const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)');
	const { t } = useTranslation();

	return (
		<PolarisProvider>
			<BrowserRouter>
				<AppBridgeProvider>
					<CustomerContext>
						<ShopContext>
							<QueryProvider>
								<NavigationMenu
									navigationLinks={[
										{
											label: t('Search Database'),
											destination: '/badcustomers',
										},

										{
											label: t('Your Customers'),
											destination: '/customers',
										},
										{
											label: t('Your Orders'),
											destination: '/orders',
										},
									]}
								/>
								<Routes pages={pages} />
							</QueryProvider>
						</ShopContext>
					</CustomerContext>
				</AppBridgeProvider>
			</BrowserRouter>
		</PolarisProvider>
	);
}
