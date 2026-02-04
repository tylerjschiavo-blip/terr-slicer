import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-4">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/slicer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Return to Territory Slicer
      </Link>
    </div>
  );
}

export default NotFoundPage;
