import React, { useState, useEffect } from 'react';
import {
    BuildingOfficeIcon,
    MapPinIcon,
    TrashIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const AdminConstituencies = () => {
    const [constituencies, setConstituencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ name: '', state: '', pincode: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:9090/api/constituencies').then(res => res.json());
            setConstituencies(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to load constituencies');
            setConstituencies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:9090/api/constituencies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setSuccess('Constituency added successfully');
                setFormData({ name: '', state: '', pincode: '' });
                loadData();
            }
        } catch (err) {
            setError('Failed to add constituency');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this constituency? Candidates depending on it may be affected.')) {
            try {
                await fetch(`http://localhost:9090/api/constituencies/${id}`, { method: 'DELETE' });
                setSuccess('Constituency deleted');
                loadData();
            } catch (err) {
                setError('Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                    <BuildingOfficeIcon className="h-6 w-6 mr-2 text-indigo-600" />
                    Add New Constituency
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Constituency Name"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="State"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Pincode"
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        required
                    />
                    <button type="submit" className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition flex items-center justify-center">
                        <PlusIcon className="h-5 w-5 mr-1" />
                        Add
                    </button>
                </form>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(constituencies) && constituencies.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-gray-900">{c.name}</h4>
                            <p className="text-sm text-gray-500 flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {c.state} - {c.pincode}
                            </p>
                        </div>
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 transition">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminConstituencies;
