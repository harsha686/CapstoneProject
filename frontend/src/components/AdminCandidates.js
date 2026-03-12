import React, { useState, useEffect } from 'react';
import { candidateService } from '../services/candidateService';
import {
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    partyName: '',
    partySymbol: '',
    photoUrl: '',
    manifesto: '',
    constituencyId: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
    loadConstituencies();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await candidateService.getAllCandidates();
      setCandidates(response.data);
    } catch (err) {
      setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const loadConstituencies = async () => {
    try {
      // console.log('Fetching constituencies via service...');
      const response = await candidateService.getConstituencies();
      // console.log('Constituencies loaded:', response.data);
      setConstituencies(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load constituencies:', err);
      setConstituencies([]);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await candidateService.toggleCandidateStatus(id);
      setSuccess('Candidate status updated');
      loadData();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await candidateService.deleteCandidate(id);
        setSuccess('Candidate deleted successfully');
        loadData();
      } catch (err) {
        setError('Failed to delete candidate');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        name: formData.name,
        manifesto: formData.manifesto,
        photoUrl: formData.photoUrl,
        active: formData.isActive,
        constituency: formData.constituencyId ? { id: parseInt(formData.constituencyId) } : null,
        party: {
          name: formData.partyName,
          symbolPath: formData.partySymbol,
          active: true // Standardize for new parties
        }
      };

      // console.log('Submitting candidate data:', dataToSubmit);

      if (editingCandidate) {
        await candidateService.updateCandidate(editingCandidate.id, dataToSubmit);
        setSuccess('Candidate updated successfully');
      } else {
        await candidateService.addCandidate(dataToSubmit);
        setSuccess('Candidate added successfully');
      }

      setShowModal(false);
      setEditingCandidate(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error saving candidate:', err);
      if (err.response) {
        console.error('Error details:', err.response.data);
      }
      setError('Failed to save candidate');
    }
  };

  const openEditModal = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      partyName: candidate.party?.name || '',
      partySymbol: candidate.party?.symbolPath || '',
      photoUrl: candidate.photoUrl || '',
      manifesto: candidate.manifesto || '',
      constituencyId: candidate.constituency?.id || '',
      isActive: candidate.active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      partyName: '',
      partySymbol: '',
      photoUrl: '',
      manifesto: '',
      constituencyId: '',
      isActive: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Candidate Management</h3>
        <button
          onClick={() => { resetForm(); setEditingCandidate(null); setShowModal(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Candidate
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      {success && <div className="p-4 bg-green-100 text-green-700 rounded-lg">{success}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Constituency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 overflow-hidden">
                      {candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <IdentificationIcon className="h-full w-full p-2 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img src={candidate.party?.symbolPath} alt="" className="h-6 w-6 mr-2" />
                    <span className="text-sm text-gray-900">{candidate.party?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {candidate.constituency?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(candidate.id)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${candidate.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {candidate.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button onClick={() => openEditModal(candidate)} className="text-indigo-600 hover:text-indigo-900">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(candidate.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Candidate Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Constituency</label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    value={formData.constituencyId}
                    onChange={(e) => setFormData({ ...formData, constituencyId: e.target.value })}
                  >
                    <option value="">Select Constituency</option>
                    {Array.isArray(constituencies) && constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Party Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    value={formData.partyName}
                    onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Party Symbol (URL)</label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/symbol.png"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    value={formData.partySymbol}
                    onChange={(e) => setFormData({ ...formData, partySymbol: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Candidate Photo (URL)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Manifesto</label>
                  <textarea
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    value={formData.manifesto}
                    onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingCandidate ? 'Update' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidates;
