import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { candidateService } from '../services/candidateService';
import { voterService } from '../services/voterService';
import { voteService } from '../services/voteService';
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon, UserGroupIcon, FlagIcon } from '@heroicons/react/24/outline';
import VoiceAssistantWidget from './VoiceAssistantWidget';

const Voting = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voterInfo, setVoterInfo] = useState(null);

  useEffect(() => {
    // if (!user) {
    //   navigate('/login');
    //   return;
    // }

    loadVotingData();
  }, [user, navigate]);

  const loadVotingData = async () => {
    try {
      setLoading(true);

      if (!user || !user.voterId) {
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Get voter information
      const voterResponse = await voterService.getVoterById(user.voterId);
      if (voterResponse.data) {
        setVoterInfo(voterResponse.data);
        setHasVoted(voterResponse.data.hasVoted);
      }

      // Get candidates for voter's constituency
      if (voterResponse.data && voterResponse.data.constituency) {
        const candidatesResponse = await candidateService.getCandidatesByConstituency(voterResponse.data.constituency.id);
        setCandidates(candidatesResponse.data);
      }
    } catch (err) {
      setError('Failed to load voting data');
      console.error('Error loading voting data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidate(candidateId);
    setError('');
  };

  const handleVote = () => {
    if (!selectedCandidate) {
      setError('Please select a candidate to vote');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmVote = async () => {
    try {
      setLoading(true);
      const response = await voteService.castVote(user.voterId, selectedCandidate);

      if (response.data.success) {
        setSuccess('Vote cast successfully! Thank you for participating in the democratic process.');
        setHasVoted(true);
        setShowConfirmation(false);

        // Auto logout after 5 seconds
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 5000);
      } else {
        setError(response.data.message || 'Failed to cast vote');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron to-green">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-saffron via-white to-green">
        <div className="app-container max-w-md w-full p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vote Already Cast</h2>
          <p className="text-gray-600 mb-6">
            You have already participated in this election. Thank you for exercising your democratic right!
          </p>
          <button
            onClick={handleLogout}
            className="btn-primary text-white px-6 py-3 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-saffron via-white to-green">
      <div className="app-container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-saffron mr-3" />
              SecureVote Ballot
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome, {voterInfo?.name || 'Voter'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6 flex items-center">
            <XCircleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* Voting Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Voting Instructions
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Select your preferred candidate by clicking on their card</li>
            <li>• Review your choice carefully - votes cannot be changed once cast</li>
            <li>• Click "Cast Vote" to submit your selection</li>
            <li>• You will be automatically logged out after voting</li>
          </ul>
        </div>

        {/* ♿ Voice Assistant for Accessibility */}
        <VoiceAssistantWidget
          candidates={candidates}
          onSelectCandidate={handleCandidateSelect}
          onSelectNota={() => handleCandidateSelect(-1)}
          onConfirmVote={() => {
            if (showConfirmation) confirmVote();
            else handleVote();
          }}
          onCancel={() => setShowConfirmation(false)}
        />

        {/* Candidates Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FlagIcon className="h-6 w-6 text-saffron mr-2" />
            Candidates for {voterInfo?.constituency?.name || 'Your Constituency'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`candidate-card p-6 rounded-lg cursor-pointer ${selectedCandidate === candidate.id ? 'selected' : ''
                  }`}
                onClick={() => handleCandidateSelect(candidate.id)}
              >
                <div className="absolute top-2 right-2 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                  #{candidates.indexOf(candidate) + 1}
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg flex items-center justify-center border border-gray-100 p-2">
                    {candidate.party?.symbolPath ? (
                      <img
                        src={candidate.party.symbolPath}
                        alt={candidate.party.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/64?text=?';
                        }}
                      />
                    ) : (
                      <div className="text-4xl text-gray-300">🗳️</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
                    <p className="text-saffron font-semibold">{candidate.party?.name || 'Independent'}</p>
                    <p className="text-gray-600 text-sm mt-2">{candidate.manifesto || 'No manifesto provided'}</p>
                  </div>
                  {selectedCandidate === candidate.id && (
                    <CheckCircleIcon className="h-8 w-8 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}

            {/* NOTA Option */}
            <div
              className={`candidate-card p-6 rounded-lg cursor-pointer ${selectedCandidate === -1 ? 'selected' : ''
                }`}
              onClick={() => handleCandidateSelect(-1)}
            >
              <div className="absolute top-2 right-2 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                #{candidates.length + 1}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-4xl">❌</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">None of the Above (NOTA)</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    Choose this option if you do not wish to vote for any candidate
                  </p>
                </div>
                {selectedCandidate === -1 && (
                  <CheckCircleIcon className="h-8 w-8 text-green-500 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cast Vote Button */}
        <div className="text-center">
          <button
            onClick={handleVote}
            disabled={!selectedCandidate || loading}
            className="btn-primary text-white px-8 py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="loading-spinner mr-2"></div>
                Processing...
              </div>
            ) : (
              'Cast Vote'
            )}
          </button>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <ShieldCheckIcon className="h-16 w-16 text-saffron mx-auto mb-4" />
              <h3 className="text-xl font-bold text-center mb-4">Confirm Your Vote</h3>
              <p className="text-gray-600 text-center mb-6">
                {selectedCandidate === -1
                  ? 'You have selected NOTA (None of the Above)'
                  : `You have selected: ${candidates.find(c => c.id === selectedCandidate)?.name}`
                }
              </p>
              <p className="text-sm text-red-600 text-center mb-6">
                ⚠️ This action cannot be undone. Please confirm your choice.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold flex-1 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmVote}
                  disabled={loading}
                  className="btn-primary text-white px-6 py-3 rounded-lg font-semibold flex-1"
                >
                  {loading ? 'Casting...' : 'Confirm Vote'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Voting;