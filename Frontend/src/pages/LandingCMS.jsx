import { useState, useEffect } from 'react';
import { useToast } from '../lib/ToastContext';
import PageHeader from '../components/PageHeader';
import { Field, Input, Textarea } from '../components/FormField';
import CoconutMark from '../components/CoconutMark';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function LandingCMS() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/landing-page')
      .then(res => res.json())
      .then(json => {
        if (!json.error) setData(json);
      })
      .catch(console.error);
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/landing-page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success('Landing page updated successfully!');
      } else {
        toast.error('Failed to update landing page.');
      }
    } catch (err) {
      toast.error('Error saving landing page.');
    } finally {
      setLoading(false);
    }
  }

  function addFeature() {
    setData({
      ...data,
      features: [...(data.features || []), { title: '', description: '' }]
    });
  }

  function removeFeature(idx) {
    const newFeatures = [...(data.features || [])];
    newFeatures.splice(idx, 1);
    setData({ ...data, features: newFeatures });
  }

  function updateFeature(idx, key, val) {
    const newFeatures = [...(data.features || [])];
    newFeatures[idx] = { ...newFeatures[idx], [key]: val };
    setData({ ...data, features: newFeatures });
  }

  if (!data) return <div className="flex h-64 items-center justify-center"><CoconutMark spin size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Landing Page Content" description="Update the content displayed on the public landing page." />

      <form onSubmit={handleSave} className="space-y-8 mt-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <Field label="Hero Title">
              <Input 
                value={data.title || ''} 
                onChange={e => setData({...data, title: e.target.value})} 
                required 
              />
            </Field>
            <Field label="Hero Subtitle">
              <Textarea 
                value={data.subtitle || ''} 
                onChange={e => setData({...data, subtitle: e.target.value})} 
                required 
              />
            </Field>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-900">Features Section</h2>
            <button 
              type="button" 
              onClick={addFeature}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} /> Add Feature
            </button>
          </div>
          
          <div className="space-y-4">
            {(data.features || []).map((feature, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-slate-100 bg-slate-50 rounded-lg">
                <div className="pt-2 text-slate-400 cursor-grab">
                  <GripVertical size={20} />
                </div>
                <div className="flex-1 space-y-3">
                  <Field label="Feature Title">
                    <Input 
                      value={feature.title} 
                      onChange={e => updateFeature(idx, 'title', e.target.value)} 
                      required 
                    />
                  </Field>
                  <Field label="Description">
                    <Textarea 
                      value={feature.description} 
                      onChange={e => updateFeature(idx, 'description', e.target.value)} 
                      required 
                    />
                  </Field>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFeature(idx)}
                  className="text-red-500 hover:text-red-600 p-2 h-fit"
                  title="Remove feature"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {(!data.features || data.features.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No features added yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Footer</h2>
          <div className="space-y-4">
            <Field label="Contact Email">
              <Input 
                type="email"
                value={data.contact_email || ''} 
                onChange={e => setData({...data, contact_email: e.target.value})} 
              />
            </Field>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
