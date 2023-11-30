import { FilterQuery, SortOrder } from 'mongoose';

export const paginateFeature = (
  model: any,
  pageNumber: number,
  pageSize: number,
  filterObject: FilterQuery<any>,
  sortingObject: { [key: string]: SortOrder },
) => {
  return model
    .find(filterObject)
    .sort(sortingObject)
    .skip((+pageNumber - 1) * +pageSize)
    .limit(+pageSize)
    .lean();
};
