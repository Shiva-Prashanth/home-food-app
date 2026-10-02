import { Star, MessageSquare } from 'lucide-react';

export default function Feedback() {
  const mockFeedback = [
    { name: "Rahul Sharma", rating: 5, comment: "Amazing taste! Completely authentic and perfectly cooked." },
    { name: "Priya Desai", rating: 4, comment: "Very good food. Packaging could be slightly better but loved the meal." },
    { name: "Arjun Verma", rating: 5, comment: "Fast delivery! The food arrived hot and the portions were great." },
    { name: "Sneha Nair", rating: 5, comment: "Best biryani I've ordered so far! Will definitely order again." },
    { name: "Vikas Singh", rating: 3, comment: "Food was okay, slightly delayed tonight." }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
      
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-yellow-500" /> Customer Feedback
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Review live comments and ratings</p>
      </div>

      {mockFeedback.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
          <h2 className="text-lg font-bold text-gray-900">No feedback yet</h2>
          <p className="text-gray-500 text-sm">Customers haven't submitted any reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockFeedback.map((fb, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 md:items-center justify-between">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-gray-900">{fb.name}</span>
                  <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 block">"{fb.comment}"</p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
