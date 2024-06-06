import { useState, useEffect } from 'react';
import { Card, TextContainer, Text } from '@shopify/polaris';
import { Toast } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useAppQuery, useAuthenticatedFetch } from '../hooks';

export function ProductsCard() {
	const emptyToastProps = { content: null };
	const [isLoading, setIsLoading] = useState(true);
	const [toastProps, setToastProps] = useState(emptyToastProps);
	const fetch = useAuthenticatedFetch();
	const { t } = useTranslation();
	const productsCount = 5;

	const {
		data,
		refetch: refetchProductCount,
		isLoading: isLoadingCount,
		isRefetching: isRefetchingCount,
	} = useAppQuery({
		url: '/api/products/count',
		reactQueryOptions: {
			onSuccess: () => {
				setIsLoading(false);
			},
		},
	});

	const toastMarkup = toastProps.content && !isRefetchingCount && (
		<Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
	);

	const handlePopulate = async () => {
		setIsLoading(true);
		const response = await fetch('/api/products', { method: 'POST' });

		if (response.ok) {
			await refetchProductCount();
			setToastProps({
				content: t('ProductsCard.productsCreatedToast', {
					count: productsCount,
				}),
			});
		} else {
			setIsLoading(false);
			setToastProps({
				content: t('ProductsCard.errorCreatingProductsToast'),
				error: true,
			});
		}
	};

	async function fetchProducts() {
		try {
			let request = await fetch('/api/products');
			let response = await request.json();
			console.log({ response });
		} catch (err) {
			console.log({ err });
		}
	}

  async function fetchOrders(){
    try{
      let request = await fetch('/api/orders');
       let ordersResponse = await request.json();
       console.log({ordersResponse})
    }
    catch(err){
      console.log({err})
    }
  }

  async function fetchCustomers(){
    try{
      let request = await fetch('/api/customers');
       let customersResponse = await request.json();
       console.log({customersResponse})
    }
    catch(err){
      console.log({err})
    }
  }

	useEffect(() => {
		fetchProducts();
    fetchOrders();
    fetchCustomers();
	}, []);

  

	return (
		<>
			{toastMarkup}
			<Card
				title={t('ProductsCard.title')}
				sectioned
				primaryFooterAction={{
					content: t('ProductsCard.populateProductsButton', {
						count: productsCount,
					}),
					onAction: handlePopulate,
					loading: isLoading,
				}}
			>
				<TextContainer spacing="loose">
					<p>{t('ProductsCard.description')}</p>
					<Text as="h4" variant="headingMd">
						{t('ProductsCard.totalProductsHeading')}
						<Text variant="bodyMd" as="p" fontWeight="semibold">
							{isLoadingCount ? '-' : data.count}
						</Text>
					</Text>
				</TextContainer>
			</Card>
		</>
	);
}
