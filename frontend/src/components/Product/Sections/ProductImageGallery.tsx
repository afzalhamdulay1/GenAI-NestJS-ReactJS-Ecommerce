import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface Image {
  url: string;
  public_id: string;
}

interface ProductImageGalleryProps {
  images?: Image[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images }) => {
  return (
    <Carousel
      showArrows={true}
      showThumbs={false}
      showStatus={false}
      infiniteLoop={true}
      autoPlay={true}
      interval={3000}
      dynamicHeight={true}
      emulateTouch={true}
    >
      {images &&
        images.map((item, i) => (
          <div key={i}>
            <img
              className="CarouselImage"
              src={item.url}
              alt={`${i} Slide`}
              style={{ maxHeight: "400px", objectFit: "contain" }}
            />
          </div>
        ))}
    </Carousel>
  );
};

export default ProductImageGallery;
