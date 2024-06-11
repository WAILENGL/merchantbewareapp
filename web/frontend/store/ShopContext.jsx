import React, { createContext, useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '../hooks';
export const ShopContext = createContext();

const ShopsContext = ({ children }) => {
	const [shop, setShop] = useState({});
	const fetch = useAuthenticatedFetch();

	async function fetchShopInfo() {
		try {
			let request = await fetch('/api/shop');
			let shopResponse = await request.json();
			setShop(shopResponse?.data[0]);
		} catch (err) {
			console.log(err.message);
		}
	}
	async function getAdminInfo() {
		try {
			let request = await fetch('/api/adminInfo');
			let adminApi = await request.json();
			console.log({ adminApi });
		} catch (err) {
			console.log(err.message);
		}
	}

	useEffect(() => {
		fetchShopInfo();
		getAdminInfo();
	}, []);

	return (
		<ShopContext.Provider value={[shop, setShop]}>
			{children}
		</ShopContext.Provider>
	);
};

export default ShopsContext;
