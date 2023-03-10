import { VehicleBrands } from '../lib/constants';
import { Rental } from '../mongo/db-client';
import { KeyValueStore } from '../mongo/key-value-store';
import { tryAgain } from '../lib/tryAgain';
import { logger } from '../lib/logger';
import { FilterName, KeyValueKey } from '../lib/enums';

interface Row4 {
  key: string;
  label: string;
  value: any;
}

interface Image {
  src: string;
}

interface Images {
  Image1: Image;
  Image2: Image;
  Image3: Image;
  Image4: Image;
}

interface Coordinates {}

interface CarFamilyTypeInfo {
  id: number;
  title: string;
  engTitle: string;
}

interface InfoBarItem {
  key: string;
  title: string;
  label: string;
  titleWithoutLabel: any;
}

interface MoreDetail {
  key: string;
  value: string;
  name: string;
}

interface CategoryDic {
  catEn: string;
  subCatEn: string;
}

interface Item {
  title_text: string;
  values: any[];
  opinions: any[];
}

interface AdvancedInfo {
  items: Item[];
}

export interface RawListing {
  line_1: string;
  line_2: string;
  line_3?: any;
  row_1: string;
  row_2: string;
  row_3: any[];
  row_4: Row4[];
  row_5: string[];
  search_text: string;
  title_1: string;
  title_2: string;
  images: Images;
  images_count: number;
  img_url: string;
  images_urls: string[];
  mp4_video_url?: any;
  video_url?: any;
  PrimaryArea: string;
  PrimaryAreaID: number;
  AreaID_text: string;
  SecondaryArea: string;
  area_id: number;
  city: string;
  coordinates: Coordinates;
  ad_highlight_type: string;
  background_color: string;
  highlight_text: string;
  order_type_id: number;
  ad_number: number;
  cat_id: number;
  customer_id: number;
  feed_source: string;
  id: string;
  link_token: string;
  merchant: boolean;
  contact_name: string;
  merchant_name?: any;
  record_id: number;
  subcat_id: string;
  currency: string;
  currency_text: string;
  price: string;
  deal_info?: any;
  date: string;
  date_added: string;
  updated_at: string;
  IsVisibleForReco: boolean;
  ad_type: string;
  can_change_layout: number;
  can_hide: number;
  default_layout: string;
  external: any[];
  is_hidden: number;
  is_liked: number;
  like_count: number;
  line_1_text_color: string;
  line_2_text_color: string;
  promotional_ad: number;
  remove_on_unlike: boolean;
  type: string;
  uid?: any;
  AirConditioner_text: string;
  Auto_text: string;
  DateOnRoad_text: string;
  EngineTypeID_text: string;
  EngineVal_text: number;
  Hand_text: string;
  ModelID_text: string;
  OwnerID_text: string;
  SubModelID_text: string;
  TradeIn_text: string;
  Year_text: number;
  fromEngineVal_text: number;
  ignition_text: string;
  manufacturer: string;
  model: string;
  moving_text: string;
  year: number;
  car_family_type: number[];
  car_family_type_info: CarFamilyTypeInfo[];
  city_text: string;
  engine_size_text: string;
  info_bar_items: InfoBarItem[];
  info_text: string;
  kilometers: string;
  main_title: string;
  main_title_params: number[];
  more_details: MoreDetail[];
  pricelist_link_url: string;
  is_business: boolean;
  ad_number_second: number;
  categoryDic: CategoryDic;
  agency_contact_name: string;
  email: boolean;
  manufacturer_eng: string;
  ModelID: number;
  advanced_info: AdvancedInfo;
  abovePrice: string;
}

interface Listing {
  manufacturer: string;
  model: string;
  year: number;
  city: string;
  id: number;
  link: string;
  kilometers: number;
  price: number;
  priceText: number;
}

// TODO: Finish this shit
export const getCars = async () => {
  const normalizedBrandCodes = [
    VehicleBrands.Daihatsu,
    VehicleBrands.Toyota,
    VehicleBrands.Mazda,
    VehicleBrands.Nissan,
    VehicleBrands.Honda,
    VehicleBrands.Hyundai,
    VehicleBrands.Mitsubishi,
  ]
    .map((car) => car.code)
    .join(',');
  const url = `https://gw.yad2.co.il/feed-search-legacy/vehicles/cars?manufacturer=${normalizedBrandCodes}&forceLdLoad=true`;
  const searchResult = await (await fetch(url)).json();
  const items: Listing[] = searchResult.feed.feed_items
    .filter((item: RawListing) => item.type === 'ad')
    .map((item: RawListing) => {
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
  return items;
};

const sanitizeFilters = (filters: Partial<Filters>) => {
  if (typeof filters !== 'object') {
    return {};
  }

  const newFilters = { ...filters };
  Object.entries(newFilters).forEach(([key, value]: [FilterName, number]) => {
    if (value == null || !Object.values(FilterName).includes(key)) {
      delete newFilters[key];
    }
  });
  return newFilters;
};

export const updateRentalFilters = async (filters: Partial<Filters>) => {
  filters = sanitizeFilters(filters);
  await Promise.all(
    Object.entries(filters).map(([key, value]: [FilterName, number]) => {
      KeyValueStore.set(createFilterKey(key), value);
    })
  );
};

export const getRentalFilters = async () => {
  // @ts-ignore
  const filters: Filters = {};

  await Promise.all(
    Object.values(FilterName).map(async (filterName) => {
      const filterKey = createFilterKey(filterName);
      filters[filterName] = (await KeyValueStore.get(filterKey)) ?? -1;
    })
  );

  return filters;
};

const createFilterKey = (filter: FilterName) => {
  return `${KeyValueKey.RentalFilterPrefix}${filter}`;
};

const getRentalFeed = async (numPages = 4): Promise<RentalFeedItem[]> => {
  const {
    minSize,
    maxSize,
    minFloor,
    maxFloor,
    minRooms,
    maxRooms,
    minPrice,
    maxPrice,
  } = await getRentalFilters();

  const createRange = (min: number, max: number) => {
    return min === -1 && max === -1 ? '' : `${min}-${max}`;
  };

  const filters = {
    forceLdLoad: true,
    priceOnly: 1,
    airConditioner: 1,
    balcony: 1,
    parking: 1,
    squaremeter: createRange(minSize, maxSize),
    rooms: createRange(minRooms, maxRooms),
    price: createRange(minPrice, maxPrice),
    floor: createRange(minFloor, maxFloor),
    page: 1,
  };
  Object.entries(filters).forEach(
    ([key, value]) => value ?? delete filters[key]
  );

  const items: RentalFeedItem[] = [];

  for (let i = 1; i <= numPages; i++) {
    filters.page = i;
    // @ts-ignore
    const queryParams = new URLSearchParams(filters).toString();
    const url = `https://gw.yad2.co.il/feed-search-legacy/realestate/rent?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) {
      break;
    }
    const responseBody = await response.json();
    items.push(...responseBody.data.feed.feed_items);
  }

  return items.filter((item) => item.ad_type === 'ad');
};

const transformFeedItemIntoRental = async (
  item: RentalFeedItem
): Promise<Rental> => {
  const url = `https://gw.yad2.co.il/feed-search-legacy/item?token=${item.id}`;
  const result = await (await fetch(url)).json();
  const itemDetails: RentalItemDetails = result.data;
  return {
    id: item.id,
    arnona: parseInt(itemDetails.property_tax) || 0,
    squareMeters: itemDetails.square_meter_build,
    postDate: itemDetails.date_added,
    entranceDate: itemDetails.date_of_entry,
    updatedDate: itemDetails.updated_at,
    floor: parseInt(item.row_3[2].split(' ')[1]) || 0,
    vadBayit: parseInt(itemDetails.HouseCommittee) || 0,
    rooms: item.Rooms_text,
    price: parseInt(itemDetails.price.replace(',', '')) || 0,
    street: itemDetails.street,
    houseNumber: itemDetails.address_home_number,
    city: itemDetails.city_text,
    rentalType: item.row_2?.split(',')[0] || null,
  };
};

export const getRentals = async () => {
  const seenRentalIDs = (await Rental.find({}).toArray()).map(
    (r) => r.listingId
  );
  const rentals = await tryAgain(
    async () => {
      const feedItems = (await getRentalFeed()).filter(
        ({ id }) => !seenRentalIDs.includes(id)
      );
      return Promise.all(feedItems.map(transformFeedItemIntoRental));
    },
    { tries: 4 }
  );
  logger.info({ amount: rentals.length }, 'found new rental listings');
  if (rentals.length) {
    await Rental.insertMany(rentals.map(({ id }) => ({ listingId: id })));
  }
  return rentals;
};

export const composeRentalText = (rental: Rental) => {
  const streetAndNumber = [rental.street, rental.houseNumber]
    .filter(Boolean)
    .join(' ');
  const city = rental.city ?? '';
  const location = [streetAndNumber, city].filter(Boolean).join(', ');
  const floorText =
    rental.floor === 0
      ? 'ground floor'
      : rental.floor
      ? `floor ${rental.floor}`
      : '';
  const rentalType = rental.rentalType ?? '';
  const size = rental.squareMeters ? `${rental.squareMeters}m²` : '';
  const price = rental.price ? `Rent: ₪${rental.price}` : '';
  const arnona = rental.arnona ? `Arnona: ₪${rental.arnona}` : '';
  const vad = rental.vadBayit ? `Vad: ₪${rental.vadBayit}` : '';
  const row1 = location ? `Location: ${location}` : '';
  const row2 = [size, floorText, rentalType].filter(Boolean).join(', ');
  const row3 = [price, arnona, vad].filter(Boolean).join(', ');
  const row4 = rental.entranceDate ? `Entrance: ${rental.entranceDate}` : '';
  return [row1, row2, row3, row4].filter(Boolean).join('\n');
};
