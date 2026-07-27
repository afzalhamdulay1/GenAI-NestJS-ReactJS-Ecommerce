const fs = require('fs');

const replaceInFileRegex = (file, regex, replacement) => {
  let content = fs.readFileSync(file, 'utf8');
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
};

replaceInFileRegex(
  'src/components/Admin/ProductReviews.tsx',
  /import \{ clearErrors, getAllReviews, deleteReviews, resetReviewState, Product \} from "\.\.\/\.\.\/features\/products\/productsSlice";/,
  'import { clearErrors, getAllReviews, deleteReviews, resetReviewState } from "../../features/products/productsSlice";\nimport { Product } from "../../types";'
);

replaceInFileRegex(
  'src/components/Admin/UpdateProduct.tsx',
  /import \{ ProductImage \} from "\.\.\/\.\.\/features\/products\/productsSlice";/,
  'import { ProductImage } from "../../types";'
);

replaceInFileRegex(
  'src/components/Cart/CartItemCard.tsx',
  /import \{ removeItemsFromCart, CartItem \} from "\.\.\/\.\.\/features\/cart\/cartSlice";/,
  'import { removeItemsFromCart } from "../../features/cart/cartSlice";\nimport { CartItem } from "../../types";'
);

replaceInFileRegex(
  'src/components/Cart/Payment.tsx',
  /import \{ createOrder, clearErrors, Order \} from "\.\.\/\.\.\/features\/order\/orderSlice";/,
  'import { createOrder, clearErrors } from "../../features/order/orderSlice";\nimport { Order } from "../../types";'
);

replaceInFileRegex(
  'src/components/Home/ProductCard.tsx',
  /import \{ Product \} from "\.\.\/\.\.\/features\/products\/productsSlice";/,
  'import { Product } from "../../types";'
);

replaceInFileRegex(
  'src/components/Layout/Header/UserOptions.tsx',
  /import \{ logoutUser, User \} from "\.\.\/\.\.\/\.\.\/features\/user\/userSlice";/,
  'import { logoutUser } from "../../../features/user/userSlice";\nimport { User } from "../../../types";'
);

replaceInFileRegex(
  'src/components/Product/ReviewCard.tsx',
  /import \{ Review \} from "\.\.\/\.\.\/features\/products\/productsSlice";/,
  'import { Review } from "../../types";'
);

replaceInFileRegex(
  'src/features/products/productSlice.ts',
  /import \{ Product \} from '\.\/productsSlice';/,
  'import { Product } from \'../../types\';'
);

replaceInFileRegex(
  'src/features/review/reviewSlice.ts',
  /import \{ Review \} from '\.\.\/products\/productsSlice';/,
  'import { Review } from \'../../types\';'
);
