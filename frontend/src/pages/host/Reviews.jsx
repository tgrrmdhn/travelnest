import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { hostService } from '../../services/host.service';

const HostReviews = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hostService.getReviews();
      
      if (response.success && response.data) {
        const reviewList = response.data.reviews || [];
        setReviews(reviewList);
        
        // Calculate statistics
        if (reviewList.length > 0) {
          const totalRating = reviewList.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / reviewList.length;
          
          const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewList.forEach(r => {
            breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
          });
          
          setStats({
            avgRating: avgRating,
            totalReviews: reviewList.length,
            ratingBreakdown: breakdown
          });
        }
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-600 mt-1">See what travelers think about your place</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Failed to load reviews</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadReviews}
              className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Average Rating */}
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {stats.avgRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mb-2">
                    {renderStars(Math.round(stats.avgRating))}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingBreakdown[rating] || 0;
                    const percentage = stats.totalReviews > 0 
                      ? (count / stats.totalReviews) * 100 
                      : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-medium text-gray-700">{rating}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-yellow-400 h-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                You haven't received any reviews yet. Keep providing great stays!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        {review.reviewer_avatar ? (
                          <img 
                            src={review.reviewer_avatar} 
                            alt={review.reviewer_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{review.reviewer_name || 'Traveler'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <div className="pl-15">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-900">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HostReviews;
