import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeHome = () => {
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem('authUser_employee') || '{}');
  const employeeName = authUser.name || 'Employee';

  const taskCards = [
    {
      title: 'Dietitian Verification',
      icon: 'fas fa-user-check',
      description: 'Verify dietitian credentials and approve professional profiles submitted for review.',
      route: '/employee/verify-dietitian',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Blog Moderation',
      icon: 'fas fa-blog',
      description: 'Review and moderate reported blog posts. Ensure all content meets community guidelines.',
      route: '/employee/blog-moderation',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      btnColor: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      title: 'Support & Team Board',
      icon: 'fas fa-headset',
      description: 'Raise queries or issues related to verifications, content, or internal matters. Collaborate with fellow employees on the Team Board.',
      route: '/employee/support',
      color: 'bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600',
      btnColor: 'bg-teal-600 hover:bg-teal-700',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1A4A40] to-[#27AE60] rounded-2xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
            {employeeName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {employeeName}!</h1>
            <p className="text-green-100 mt-1 text-lg">NutriConnect Employee Portal</p>
          </div>
        </div>
        <p className="mt-4 text-green-100 max-w-2xl">
          You're logged in as an organization employee. Use the sidebar or the quick links below to access your assigned tasks.
        </p>
      </div>

      {/* Task Cards */}
      <h2 className="text-xl font-bold text-[#1A4A40] mb-4">
        <i className="fas fa-tasks mr-2"></i>Your Tasks
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {taskCards.map((card) => (
          <div
            key={card.route}
            className={`rounded-2xl border-2 p-6 ${card.color} transition-all duration-200 hover:shadow-md`}
          >
            <div className={`text-4xl mb-4 ${card.iconColor}`}>
              <i className={card.icon}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{card.description}</p>
            <button
              onClick={() => navigate(card.route)}
              className={`${card.btnColor} text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm`}
            >
              <i className="fas fa-arrow-right mr-2"></i>Go to {card.title}
            </button>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1A4A40] mb-3">
          <i className="fas fa-info-circle mr-2 text-[#27AE60]"></i>About Your Role
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-[#27AE60] mt-0.5"></i>
            <span><strong>Dietitian Verification:</strong> Examine credentials, licenses, and documents submitted by dietitians to ensure they meet platform standards.</span>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-[#27AE60] mt-0.5"></i>
            <span><strong>Blog Moderation:</strong> Review user-submitted blog posts that have been reported for inappropriate or low-quality content.</span>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-[#27AE60] mt-0.5"></i>
            <span><strong>Support & Team Board:</strong> Submit queries or issues to the organization, and communicate with fellow employees via the shared team board.</span>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-[#27AE60] mt-0.5"></i>
            <span>All actions are logged and reviewed by your organization's management team.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;
