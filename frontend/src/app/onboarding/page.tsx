'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profileApi } from '@/lib/api';

const steps = ['Basic Info', 'Preferences', 'Lifestyle', 'Photos'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    gender: '',
    dateOfBirth: '',
    sexualOrientation: '',
    relationshipGoals: '',
    interests: [] as string[],
    preferences: {
      minAge: 18,
      maxAge: 50,
      gender: '',
      distanceKm: 50,
    },
    lifestyle: {
      smoking: '',
      drinking: '',
      diet: '',
      exercise: '',
      pets: '',
      religion: '',
    },
  });

  const interestOptions = [
    'Travel', 'Music', 'Sports', 'Art', 'Food', 'Movies',
    'Books', 'Fitness', 'Gaming', 'Cooking', 'Photography', 'Dancing',
  ];

  const toggleInterest = (interest: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await profileApi.update(data);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <span className="text-2xl">💕</span>
            <span className="text-xl font-bold text-primary-600">Dating02</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Set Up Your Profile</h1>
          <p className="text-gray-600">Step {step + 1} of {steps.length}: {steps[step]}</p>
        </div>

        {/* Progress bar */}
        <div className="flex space-x-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${i <= step ? 'bg-primary-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="card">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    className="input-field"
                    value={data.firstName}
                    onChange={(e) => setData({ ...data, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    className="input-field"
                    value={data.lastName}
                    onChange={(e) => setData({ ...data, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    className="input-field"
                    value={data.gender}
                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="NON_BINARY">Non-binary</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    className="input-field"
                    value={data.dateOfBirth}
                    onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Goals</label>
                <select
                  className="input-field"
                  value={data.relationshipGoals}
                  onChange={(e) => setData({ ...data, relationshipGoals: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="casual">Casual Dating</option>
                  <option value="serious">Serious Relationship</option>
                  <option value="friendship">Friendship</option>
                  <option value="companion">Companion</option>
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Interests</h2>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      data.interests.includes(interest)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <h3 className="text-md font-semibold mt-4">Partner Preferences</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
                  <input
                    type="number"
                    className="input-field"
                    value={data.preferences.minAge}
                    onChange={(e) => setData({ ...data, preferences: { ...data.preferences, minAge: parseInt(e.target.value) } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
                  <input
                    type="number"
                    className="input-field"
                    value={data.preferences.maxAge}
                    onChange={(e) => setData({ ...data, preferences: { ...data.preferences, maxAge: parseInt(e.target.value) } })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Gender</label>
                <select
                  className="input-field"
                  value={data.preferences.gender}
                  onChange={(e) => setData({ ...data, preferences: { ...data.preferences, gender: e.target.value } })}
                >
                  <option value="">Any</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="NON_BINARY">Non-binary</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Lifestyle</h2>
              {[
                { key: 'smoking', label: 'Smoking', options: ['Never', 'Occasionally', 'Regularly'] },
                { key: 'drinking', label: 'Drinking', options: ['Never', 'Occasionally', 'Regularly'] },
                { key: 'diet', label: 'Diet', options: ['Omnivore', 'Vegetarian', 'Vegan', 'Keto'] },
                { key: 'exercise', label: 'Exercise', options: ['Never', 'Sometimes', 'Regularly', 'Daily'] },
                { key: 'pets', label: 'Pets', options: ['None', 'Dog', 'Cat', 'Other'] },
                { key: 'religion', label: 'Religion', options: ['None', 'Christian', 'Muslim', 'Hindu', 'Buddhist', 'Other'] },
              ].map(({ key, label, options }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <select
                    className="input-field"
                    value={(data.lifestyle as any)[key]}
                    onChange={(e) => setData({ ...data, lifestyle: { ...data.lifestyle, [key]: e.target.value } })}
                  >
                    <option value="">Select</option>
                    {options.map((opt) => <option key={opt} value={opt.toLowerCase()}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Add Photos</h2>
              <p className="text-gray-600 text-sm">Upload your best photos to attract more matches.</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-gray-600 mb-2">Click or drag photos here</p>
                <p className="text-gray-400 text-xs">JPG, PNG, WEBP up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="photo-upload"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    for (const file of files) {
                      try {
                        await profileApi.uploadPhoto(file);
                      } catch (err) {
                        console.error('Upload failed:', err);
                      }
                    }
                  }}
                />
                <label htmlFor="photo-upload" className="mt-3 btn-primary cursor-pointer inline-block">
                  Choose Photos
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="btn-secondary disabled:opacity-50"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button onClick={handleNext} className="btn-primary">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : 'Finish Setup'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center mt-4 text-sm text-gray-500">
          <button onClick={() => router.push('/dashboard')} className="hover:text-primary-500">
            Skip for now →
          </button>
        </p>
      </div>
    </div>
  );
}
