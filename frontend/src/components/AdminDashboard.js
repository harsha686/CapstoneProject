import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import {
  ChartBarIcon,
  UsersIcon,
  ShieldCheckIcon,
  FlagIcon,
  CheckCircleIcon,
  ArrowLeftOnRectangleIcon,
  IdentificationIcon as CandidateIcon,
  GlobeAltIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import AdminCandidates from './AdminCandidates';
import AdminConstituencies from './AdminConstituencies';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // ─── State ───────────────────────────────────────────────────────────────────
  const [statistics, setStatistics] = useState(null);
  const [voters, setVoters] = useState([]);
  const [results, setResults] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingVoters, setLoadingVoters] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);

  const [votersError, setVotersError] = useState('');
  const [resultsError, setResultsError] = useState('');
  const [success, setSuccess] = useState('');

  // ─── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== 'election_commissioner') {
      navigate('/login');
    }
  }, [user, navigate]);

  // ─── Load overview statistics on mount ───────────────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const res = await adminService.getStatistics();
        setStatistics(res.data);
      } catch (err) {
        console.error('Failed to load statistics:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  // ─── Load Voters when tab is activated ───────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'voters') return;
    const loadVoters = async () => {
      try {
        setLoadingVoters(true);
        setVotersError('');
        const res = await adminService.getVoters();
        setVoters(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load voters:', err);
        setVotersError('Failed to load voter list. Please try again.');
      } finally {
        setLoadingVoters(false);
      }
    };
    loadVoters();
  }, [activeTab]);

  // ─── Load Results when tab is activated ──────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'results') return;
    const loadResults = async () => {
      try {
        setLoadingResults(true);
        setResultsError('');
        const res = await adminService.getResults();
        setResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load results:', err);
        setResultsError('Failed to load election results. Please try again.');
      } finally {
        setLoadingResults(false);
      }
    };
    loadResults();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ─── Sub-components ──────────────────────────────────────────────────────────
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="stat-card p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  const Spinner = () => (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron"></div>
    </div>
  );

  // ─── Tab Renders ─────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      {loadingStats ? <Spinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Voters" value={statistics?.totalVoters ?? 0} icon={UsersIcon} color="text-blue-500" />
          <StatCard title="Verified Voters" value={statistics?.verifiedVoters ?? 0} icon={ShieldCheckIcon} color="text-green-500" />
          <StatCard title="Votes Cast" value={statistics?.votedVoters ?? 0} icon={ChartBarIcon} color="text-saffron" />
          <StatCard title="Voter Turnout" value={`${(statistics?.voterTurnoutPercentage ?? 0).toFixed(1)}%`} icon={FlagIcon} color="text-purple-500" />
        </div>
      )}

      <div className="admin-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Election Control</h3>
        <div className="flex space-x-4">
          <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">
            End Election
          </button>
          <button onClick={() => setActiveTab('results')} className="btn-primary text-white px-6 py-3 rounded-lg font-semibold">
            View Results
          </button>
        </div>
      </div>
    </div>
  );

  const renderVoters = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Voter Management</h3>
        <span className="bg-saffron text-white px-4 py-2 rounded-lg text-sm font-semibold">
          {voters.filter(v => !v.verified).length} Pending Verification
        </span>
      </div>

      {votersError && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{votersError}</div>}

      {loadingVoters ? <Spinner /> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'EPIC Number', 'Constituency', 'Status', 'Voted'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voters.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No voters registered yet.</td></tr>
              ) : voters.map(voter => (
                <tr key={voter.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{voter.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voter.epicNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voter.constituencyName || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${voter.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {voter.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${voter.hasVoted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                      {voter.hasVoted ? '✓ Voted' : 'Not voted'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    const totalVotes = results.reduce((sum, r) => sum + (r.totalVotes ?? 0), 0);

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Election Results</h3>

        {resultsError && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{resultsError}</div>}

        {loadingResults ? <Spinner /> : results.length === 0 ? (
          <div className="admin-card p-10 rounded-lg text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No active candidates or votes yet.</p>
            <p className="text-gray-400 text-sm mt-1">Results will appear here once candidates exist and votes are cast.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r, i) => {
              const pct = totalVotes > 0 ? ((r.totalVotes / totalVotes) * 100).toFixed(1) : '0.0';
              return (
                <div key={r.candidateId} className="admin-card p-5 rounded-lg flex items-center gap-4">
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                    ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-white text-gray-400 border'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>

                  {/* Party symbol */}
                  {r.partySymbol ? (
                    <img src={r.partySymbol} alt={r.partyName} className="w-10 h-10 object-contain rounded bg-white border p-1 flex-shrink-0"
                      onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 text-lg">🗳️</div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{r.candidateName}</p>
                    <p className="text-sm text-gray-500">{r.partyName} · {r.constituencyName}</p>
                    {/* Progress bar */}
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-saffron h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>

                  {/* Vote count */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-gray-900">{r.totalVotes}</p>
                    <p className="text-sm text-gray-500">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Overall stats */}
        <div className="admin-card p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Overall Statistics</h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Votes Cast</p>
              <p className="text-3xl font-bold text-gray-900">{statistics?.votedVoters ?? totalVotes}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall Turnout</p>
              <p className="text-3xl font-bold text-gray-900">{(statistics?.voterTurnoutPercentage ?? 0).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVerification = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Pending Verification</h3>
      {voters.filter(v => !v.verified).length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">All voters are verified!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {voters.filter(v => !v.verified).map(voter => (
            <div key={voter.id} className="admin-card p-4 rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{voter.name}</h4>
                <p className="text-sm text-gray-500">EPIC: {voter.epicNumber}</p>
                <p className="text-sm text-gray-500">Constituency: {voter.constituencyName}</p>
              </div>
              <span className="text-yellow-600 text-sm font-medium">Pending</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Main Render ─────────────────────────────────────────────────────────────
  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'voters', label: 'Voters' },
    { key: 'verification', label: 'Verification' },
    { key: 'results', label: 'Results' },
    { key: 'candidates', label: 'Candidates' },
    { key: 'regions', label: 'Regions' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron via-white to-green">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-saffron mr-3" />
              Election Commission Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.username}</p>
          </div>
          <button onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center">
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>

        {success && (
          <div className="alert alert-success mb-6 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />{success}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-200 rounded-lg p-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${activeTab === tab.key ? 'bg-white text-saffron shadow' : 'text-gray-600 hover:text-gray-800'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="fade-in">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'voters' && renderVoters()}
          {activeTab === 'verification' && renderVerification()}
          {activeTab === 'results' && renderResults()}
          {activeTab === 'candidates' && <AdminCandidates />}
          {activeTab === 'regions' && <AdminConstituencies />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;