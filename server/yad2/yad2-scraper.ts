import axios from 'axios';

export const getCars = async () => {
  const { data } = await axios.get(
    'https://gw.yad2.co.il/feed-search-legacy/vehicles/cars?manufacturer=1,53,96&forceLdLoad=true',
    { headers: { 'accept-encoding': null } }
  );
  const items = data.data.feed.feed_items
    .filter((item) => item.type === 'ad')
    .map(({ item }) => {
      const price = parseInt(item.price.replace(',', ''));

      return {
        manufacturer: item.manufacturer,
        model: item.model,
        year: item.year,
        city: item.city,
        id: item.ad_number,
        link: `https://www.yad2.co.il/item/${item.id}`,
        kilometers: Number(item.kilometers.replace(',', '')),
        price,
        priceText: `${item.currency_text}${price}`,
      };
    });

  console.log(data.data);
};