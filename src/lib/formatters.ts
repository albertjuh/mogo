export const formatCurrency = (amount: number | null) => {
    if (amount === null) return '';
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
    return amount.toString();
};
