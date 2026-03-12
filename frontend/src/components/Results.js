import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline';

const Results = () => {
    const [results, setResults] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [resRes, statsRes] = await Promise.all([
                    adminService.getResults(),
                    adminService.getStatistics(),
                ]);
                setResults(Array.isArray(resRes.data) ? resRes.data : []);
                setStats(statsRes.data);
            } catch (err) {
                setError('Failed to load results. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const totalVotes = results.reduce((sum, r) => sum + (r.totalVotes ?? 0), 0);

    const medalFor = (i) => {
        if (i === 0) return '🥇';
        if (i === 1) return '🥈';
        if (i === 2) return '🥉';
        return i + 1;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-saffron via-white to-green p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4">🗳️</div>
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Election Results</h1>
                    <p className="text-gray-500">Live results — updated in real time</p>
                    <Link to="/login" className="mt-4 inline-block text-saffron font-semibold hover:underline text-sm">
                        ← Back to Login
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron"></div>
                    </div>
                ) : results.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow p-12 text-center">
                        <ChartBarIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No results yet</h3>
                        <p className="text-gray-400 mt-2">Results will appear once candidates are confirmed and voting begins.</p>
                    </div>
                ) : (
                    <>
                        {/* Overall stats bar */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {[
                                { label: 'Total Voters', value: stats?.totalVoters ?? 0 },
                                { label: 'Votes Cast', value: stats?.votedVoters ?? totalVotes },
                                { label: 'Turnout', value: `${(stats?.voterTurnoutPercentage ?? 0).toFixed(1)}%` },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-white rounded-2xl shadow p-5 text-center">
                                    <p className="text-sm text-gray-500">{label}</p>
                                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Leaderboard */}
                        <div className="space-y-4">
                            {/* Winner banner */}
                            {results[0] && (
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-6 flex items-center gap-4 mb-6">
                                    <div className="text-5xl">🏆</div>
                                    <div className="flex-1">
                                        <p className="text-yellow-900 text-sm font-semibold uppercase tracking-wide">Leading Candidate</p>
                                        <h2 className="text-2xl font-extrabold text-white">{results[0].candidateName}</h2>
                                        <p className="text-yellow-100">{results[0].partyName} · {results[0].constituencyName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-extrabold text-white">{results[0].totalVotes}</p>
                                        <p className="text-yellow-200 text-sm">votes</p>
                                    </div>
                                </div>
                            )}

                            {results.map((r, i) => {
                                const pct = totalVotes > 0 ? ((r.totalVotes / totalVotes) * 100).toFixed(1) : '0.0';
                                return (
                                    <div key={r.candidateId} className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-xl font-bold rounded-full
                      bg-gray-100 text-gray-500">
                                            {medalFor(i)}
                                        </div>
                                        {r.partySymbol ? (
                                            <img src={r.partySymbol} alt={r.partyName}
                                                className="w-12 h-12 object-contain rounded-lg border bg-white p-1 flex-shrink-0"
                                                onError={e => { e.target.style.display = 'none'; }} />
                                        ) : (
                                            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg text-2xl border">🗳️</div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900">{r.candidateName}</p>
                                            <p className="text-sm text-gray-500">{r.partyName} · {r.constituencyName}</p>
                                            <div className="mt-2 bg-gray-100 rounded-full h-2">
                                                <div
                                                    className="bg-saffron h-2 rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-2xl font-extrabold text-gray-900">{r.totalVotes}</p>
                                            <p className="text-sm text-gray-400">{pct}%</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Results;
