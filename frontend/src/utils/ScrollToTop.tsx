import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    // Temporarily disable smooth scrolling
    const htmlElement = document.documentElement;
    const originalScrollBehavior = htmlElement.style.scrollBehavior;

    htmlElement.style.scrollBehavior = "auto"; // Disable smooth scrolling
    window.scrollTo(0, 0); // Scroll to the top instantly
    htmlElement.style.scrollBehavior = originalScrollBehavior; // Restore original behavior
  }, [pathname]);

  return null;
}

export default ScrollToTop;
