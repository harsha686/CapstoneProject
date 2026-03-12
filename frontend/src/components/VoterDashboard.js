import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateService } from '../services/candidateService';
import {
    IdentificationIcon,
    MapPinIcon,
    TicketIcon
} from '@heroicons/react/24/outline';

const VoterDashboard = () => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadActiveCandidates();
    }, []);

    const loadActiveCandidates = async () => {
        try {
            setLoading(true);
            const response = await candidateService.getActiveCandidates();
            setCandidates(response.data);
        } catch (err) {
            setError('Failed to load candidates for election');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Election Dashboard
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        Meet your candidates and review their manifestos before casting your secure vote.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {candidates.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow">
                        <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No active candidates</h3>
                        <p className="mt-1 text-sm text-gray-500">The candidate list for your constituency has not been finalized yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {candidates.map((candidate) => (
                            <div key={candidate.id} className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 transition-transform hover:scale-105">
                                <div className="relative h-48 bg-indigo-600">
                                    {candidate.photoUrl ? (
                                        <img className="w-full h-full object-cover" src={candidate.photoUrl} alt={candidate.name} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white opacity-20">
                                            <IdentificationIcon className="h-32 w-32" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
                                        <img className="h-8 w-8" src={candidate.party?.symbolPath} alt={candidate.party?.name} />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{candidate.name}</h3>
                                            <p className="text-indigo-600 font-semibold">{candidate.party?.name}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-gray-500 text-sm">
                                        <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                        {candidate.constituency?.name}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-gray-600 text-sm line-clamp-3 italic">
                                            "{candidate.manifesto || "No manifesto available"}"
                                        </p>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate('/vote')}
                                            className="w-full bg-saffron text-white py-3 px-4 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-colors">
                                            VOTE NOW
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoterDashboard;
