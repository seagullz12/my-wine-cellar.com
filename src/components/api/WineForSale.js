// components/api/WineForSale.js

export const PostForSale = async (wineId, wineData, user) => {
    if (!user) throw new Error('User not authenticated.');

    const token = await user.getIdToken();
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/add-wine-for-sale`, {
        method: 'POST',  // Ensure you're using POST here
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            wineId: wineId,// || null,  // Allow for null to create a new wine
            price: wineData.price,
            quantity: wineData.quantity,
            condition: wineData.condition,
        }),
    });

    if (!response.ok) {
        throw new Error('Error processing wine data');
    }

    const processedWine = await response.json();
    return processedWine.data;
};
