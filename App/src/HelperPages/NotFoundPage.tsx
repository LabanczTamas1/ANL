import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-4xl font-bold text-red-600">404 Not Found</h1>
      <p className="mt-4 text-lg">
        <Link to="/" className="text-blue-500 hover:underline">
          Go back
        </Link>
      </p>
    </div>
  );
}
