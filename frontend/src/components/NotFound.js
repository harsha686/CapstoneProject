import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron via-white to-green p-6">
        <div className="text-center">
            <p className="text-9xl font-extrabold text-saffron opacity-30 select-none">404</p>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h1>
            <p className="text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login"
                    className="bg-saffron text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                    Go to Login
                </Link>
                <Link to="/results"
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    View Results
                </Link>
            </div>
        </div>
    </div>
);

export default NotFound;
