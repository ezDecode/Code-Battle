import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/services/api";
import { 
  X, 
  Users, 
  Globe, 
  Lock, 
  AlertCircle,
  Loader2
} from "lucide-react";

export function TeamCreationModal() {
  const { state, actions } = useApp();
  const { modals } = state;
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!modals.teamCreation) return null;

  const closeModal = () => {
    actions.toggleModal('teamCreation', false);
    setFormData({ name: '', description: '', isPublic: true });
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset error when input changes
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.name.trim()) {
        setError('Team name is required');
        setIsLoading(false);
        return;
      }

      if (formData.name.length < 3) {
        setError('Team name must be at least 3 characters long');
        setIsLoading(false);
        return;
      }

      if (formData.name.length > 50) {
        setError('Team name must be less than 50 characters');
        setIsLoading(false);
        return;
      }

      // Create team
      const teamData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isPublic: formData.isPublic
      };

      const response = await api.teams.create(teamData);
      
      // Success handling
      toast.success(`Team "${formData.name}" created successfully!`, {
        title: 'Team Created! 🎉',
        action: {
          label: 'View Team',
          onClick: () => actions.toggleModal('teamDetails', true)
        }
      });

      // Update user's team in context
      actions.setTeam(response.team);
      
      // Close modal
      closeModal();

      // Refresh dashboard data
      actions.fetchDashboardData();

    } catch (error) {
      console.error('Team creation error:', error);
      setError(error.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      closeModal();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#F5F5DC] p-4 text-black border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#FF0000]/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#FF0000]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">Create Team</h2>
                  <p className="text-gray-700 text-sm">Start your coding journey together</p>
                </div>
              </div>
              {!isLoading && (
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-black/10 rounded-lg transition-colors text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="p-4">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                    disabled={isLoading}
                    maxLength={50}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.name.length}/50 characters
                </p>
              </div>

              {/* Team Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your team's goals and interests..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0000] focus:border-transparent resize-none"
                  disabled={isLoading}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/200 characters
                </p>
              </div>

              {/* Privacy Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Privacy
                </label>
                <div className="space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={formData.isPublic}
                      onChange={() => handleInputChange('isPublic', true)}
                      className="mt-1 text-[#FF0000] focus:ring-[#FF0000]"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-[#FF0000]" />
                        <span className="font-medium text-gray-900">Public</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Anyone can see and join your team
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="privacy"
                      checked={!formData.isPublic}
                      onChange={() => handleInputChange('isPublic', false)}
                      className="mt-1 text-[#FF0000] focus:ring-[#FF0000]"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Private</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Only members you invite can join
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className="w-full py-2.5 bg-[#FF0000] text-white font-semibold rounded-lg hover:bg-[#FF0000]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating Team...</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-5 w-5" />
                      <span>Create Team</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Info */}
            <div className="mt-3 p-2.5 bg-[#F5F5DC] border border-[#FF0000]/20 rounded-lg">
              <p className="text-sm text-gray-800">
                <strong>💡 Tip:</strong> You'll become the team captain and can invite up to 3 more members to join your coding adventures!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TeamCreationModal;
