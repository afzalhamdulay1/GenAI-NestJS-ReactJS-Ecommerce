import { Query } from 'mongoose';

export class ApiFeatures<T> {
  query: Query<T[], T>;
  queryStr: Record<string, any>;

  constructor(query: Query<T[], T>, queryStr: Record<string, any>) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          $or: [
            {
              name: {
                $regex: this.queryStr.keyword,
                $options: 'i',
              },
            },
            {
              category: {
                $regex: this.queryStr.keyword,
                $options: 'i',
              },
            },
            {
              description: {
                $regex: this.queryStr.keyword,
                $options: 'i',
              },
            },
            {
              tags: {
                $regex: this.queryStr.keyword,
                $options: 'i',
              },
            },
            {
              metaTitle: {
                $regex: this.queryStr.keyword,
                $options: 'i',
              },
            },
          ],
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // Removing some fields for category
    const removeFields = ['keyword', 'page', 'limit'];
    removeFields.forEach((key) => delete queryCopy[key]);

    const nestedQuery: any = {};
    Object.keys(queryCopy).forEach((key) => {
      if (queryCopy[key] === undefined) return;
      
      const match = key.match(/^([^\[]+)\[([^\]]+)\]$/);
      if (match) {
        const field = match[1];
        const operator = match[2];
        if (!nestedQuery[field]) {
          nestedQuery[field] = {};
        }
        nestedQuery[field][operator] = queryCopy[key];
      } else {
        nestedQuery[key] = queryCopy[key];
      }
    });

    Object.keys(nestedQuery).forEach(key => {
      // If the value is a string, apply case-insensitive regex
      if (typeof nestedQuery[key] === 'string') {
        nestedQuery[key] = {
          $regex: nestedQuery[key],
          $options: 'i', // Case-insensitive
        };
      }
    });

    // Filter For Price and Rating
    let queryStr = JSON.stringify(nestedQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage: number) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}
