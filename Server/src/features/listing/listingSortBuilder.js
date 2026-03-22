import { LISTING_SORT_OPTIONS } from "./listingSort.js";

/*
|--------------------------------------------------------------------------
| Listing Sort Map
|--------------------------------------------------------------------------
|  1  = ascending
| -1  = descending
*/
const SORT_MAP = {
  [LISTING_SORT_OPTIONS.PRICE_ASC]: { price: 1 },
  [LISTING_SORT_OPTIONS.PRICE_DESC]: { price: -1 },
  [LISTING_SORT_OPTIONS.OLDEST]: { createdAt: 1 },
  [LISTING_SORT_OPTIONS.LATEST]: { createdAt: -1 },
};

/*
|--------------------------------------------------------------------------
| Build Listing Sort
|--------------------------------------------------------------------------
| Returns MongoDB sort object based on query sort value
*/
export const buildListingSort = (sort) => {
  if (!sort) {
    return SORT_MAP[LISTING_SORT_OPTIONS.LATEST];
  }

  return SORT_MAP[sort] || SORT_MAP[LISTING_SORT_OPTIONS.LATEST];
};