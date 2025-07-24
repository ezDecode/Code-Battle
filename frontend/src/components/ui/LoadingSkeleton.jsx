import { motion } from "framer-motion";

// Reusable skeleton components for loading states
export const SkeletonCard = ({ className = "", children }) => (
  <motion.div
    className={`bg-white rounded-2xl p-6 ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export const SkeletonText = ({ lines = 1, width = "full" }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`h-4 bg-gray-200 rounded animate-pulse ${
          width === "full" ? "w-full" : 
          width === "3/4" ? "w-3/4" : 
          width === "1/2" ? "w-1/2" : 
          width === "1/4" ? "w-1/4" : 
          `w-${width}`
        }`}
      />
    ))}
  </div>
);

export const SkeletonCircle = ({ size = "w-10 h-10" }) => (
  <div className={`${size} bg-gray-200 rounded-full animate-pulse`} />
);

export const SkeletonButton = ({ width = "w-24", height = "h-10" }) => (
  <div className={`${width} ${height} bg-gray-200 rounded-lg animate-pulse`} />
);

// Dashboard-specific skeletons
export const DashboardStatsSkeleton = () => (
  <SkeletonCard className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-blue-500 to-purple-600">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <SkeletonCircle size="w-10 h-10" />
        <SkeletonText lines={1} width="1/2" />
      </div>
      <SkeletonCircle size="w-8 h-8" />
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-1">
          <SkeletonText lines={1} width="1/2" />
          <SkeletonText lines={1} width="3/4" />
        </div>
      ))}
    </div>
  </SkeletonCard>
);

export const TeamCardSkeleton = () => (
  <SkeletonCard className="lg:col-span-1 bg-gradient-to-br from-green-500 to-teal-600">
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonCircle size="w-8 h-8" />
      <SkeletonText lines={1} width="1/2" />
    </div>
    
    <div className="space-y-3">
      <div>
        <SkeletonText lines={1} width="1/3" />
        <SkeletonText lines={1} width="1/2" />
      </div>
      <div className="flex justify-between">
        <SkeletonText lines={1} width="1/4" />
        <SkeletonText lines={1} width="1/4" />
      </div>
      <div className="flex justify-between">
        <SkeletonText lines={1} width="1/4" />
        <SkeletonText lines={1} width="1/4" />
      </div>
    </div>
  </SkeletonCard>
);

export const LeaderboardCardSkeleton = () => (
  <SkeletonCard className="lg:col-span-1 bg-gradient-to-br from-orange-500 to-red-600">
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonCircle size="w-8 h-8" />
      <SkeletonText lines={1} width="1/2" />
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <SkeletonCircle size="w-6 h-6" />
        <SkeletonText lines={1} width="3/4" />
      </div>
      <div className="flex items-center justify-between">
        <SkeletonText lines={1} width="1/3" />
        <SkeletonText lines={1} width="1/4" />
      </div>
      <SkeletonText lines={1} width="1/2" />
    </div>
  </SkeletonCard>
);

export const ChallengesCardSkeleton = () => (
  <SkeletonCard className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-500 to-blue-600">
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonCircle size="w-10 h-10" />
      <SkeletonText lines={1} width="1/2" />
    </div>
    
    <div className="grid gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
          <div className="flex items-center space-x-3">
            <SkeletonCircle size="w-4 h-4" />
            <div>
              <SkeletonText lines={1} width="1/2" />
              <SkeletonText lines={1} width="1/3" />
            </div>
          </div>
          <SkeletonCircle size="w-4 h-4" />
        </div>
      ))}
    </div>
  </SkeletonCard>
);

export const RecentActivitySkeleton = () => (
  <SkeletonCard className="lg:col-span-1 bg-gradient-to-br from-purple-500 to-pink-600">
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonCircle size="w-8 h-8" />
      <SkeletonText lines={1} width="1/2" />
    </div>
    
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-1">
          <SkeletonText lines={1} width="3/4" />
          <div className="flex justify-between">
            <SkeletonText lines={1} width="1/4" />
            <SkeletonText lines={1} width="1/3" />
          </div>
        </div>
      ))}
    </div>
  </SkeletonCard>
);

// Loading state component for entire dashboard
export const DashboardLoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Section Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <SkeletonText lines={1} width="1/2" />
        <div className="mt-2">
          <SkeletonText lines={1} width="1/3" />
        </div>
      </motion.div>

      {/* Main Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatsSkeleton />
        <TeamCardSkeleton />
        <LeaderboardCardSkeleton />
        <ChallengesCardSkeleton />
        <RecentActivitySkeleton />
      </div>
    </div>
  </div>
);
