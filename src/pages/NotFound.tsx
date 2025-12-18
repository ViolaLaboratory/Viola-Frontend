import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MousePointerClick } from "lucide-react";

/**
 * NotFound (404) Page Component
 * Displays a friendly error page when users navigate to non-existent routes
 *
 * Features:
 * - Eye-catching gradient background (Viola brand colors)
 * - Clear 404 message with Viola-themed copy
 * - Call-to-action button to return home
 * - Logs 404 errors to console for debugging
 */
const NotFound = () => {
  const location = useLocation();

  /**
   * Scrolls to top of page on mount
   * Ensures users see the 404 message when page loads
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Logs 404 errors to console for debugging purposes
   * Tracks which routes users are attempting to access
   */
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,#E4EA04_0%,#EE481F_70%)] font-dm">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold font-zen text-black">404</h1>
        <p className="mb-4 text-xl pb-4 text-black">We index songs... but not this page apparently.</p>
        <a href="/" className="text-white bg-black py-2 px-4 rounded-lg 
        hover:bg-white hover:text-black transition ease-in-out duration-500 flex gap-4 justify-center m-auto">
          <MousePointerClick />
          Let's go somewhere useful
        </a>
      </div>
    </div>
  );
};

export default NotFound;
