import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrganizationHome = () => {
  const navigate = useNavigate();

  const dutyItems = [
    { title: 'Manage Employees',  icon: 'fas fa-users-cog',  text: 'Add, update, activate or deactivate employees within your organization. Bulk-upload via CSV.',      route: '/organization/employee-management', accent: 'border-blue-500',   iconColor: 'text-blue-500',   hover: 'hover:bg-blue-50'   },
    { title: 'Monitor Employees', icon: 'fas fa-chart-line', text: 'Track employee activity, task completion, and performance metrics across your team.',                 route: '/organization/employee-monitoring',  accent: 'border-indigo-500', iconColor: 'text-indigo-500', hover: 'hover:bg-indigo-50' },
    { title: 'Verify Dietitians', icon: 'fas fa-user-check', text: 'Review and approve credentials for new dietitian registrations to maintain platform trust.',          route: '/organization/verify-dietitian',    accent: 'border-yellow-500', iconColor: 'text-yellow-500', hover: 'hover:bg-yellow-50' },
    { title: 'Moderate Blogs',    icon: 'fas fa-blog',       text: 'Govern community-submitted blog content. Remove inappropriate or low-quality posts.',                 route: '/organization/blog-moderation',     accent: 'border-red-400',    iconColor: 'text-red-400',    hover: 'hover:bg-red-50'    },
  ];

  const quickLinks = [
    { title: 'Employee Management', subtitle: 'Add, update & manage your team',        icon: 'fas fa-users',          gradient: 'from-blue-500 to-blue-700',        link: '/organization/employee-management' },
    { title: 'Employee Monitoring', subtitle: 'Track activity & performance',           icon: 'fas fa-chart-bar',      gradient: 'from-indigo-500 to-indigo-700',    link: '/organization/employee-monitoring'  },
    { title: 'Verify Dietitians',   subtitle: 'Review pending credential submissions',  icon: 'fas fa-clipboard-check', gradient: 'from-[#27AE60] to-[#1A4A40]',    link: '/organization/verify-dietitian'     },
  ];

  const modelSteps = [
    { step: '01', icon: 'fas fa-building',  title: 'Organization Account', desc: 'Your organization is verified by the platform admin. Once approved, you gain full access to manage your team.' },
    { step: '02', icon: 'fas fa-user-plus', title: 'Add Employees',        desc: 'Add individual employees or bulk-upload via CSV. Each gets a unique license number and login credentials.'     },
    { step: '03', icon: 'fas fa-tasks',     title: 'Employees Work',       desc: 'Employees log in to their own portal and handle dietitian verifications, blog moderation, and team support.'   },
    { step: '04', icon: 'fas fa-eye',       title: 'You Oversee',          desc: 'Monitor all employee activity, manage their status (active/inactive), and maintain full governance control.'   },
  ];

  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    { q: 'How do I add employees to my organization?',                                         a: 'Go to Employee Management and click "Add Employee" to add individually, or use "Bulk Upload" to import multiple employees at once via CSV.' },
    { q: 'What can employees do on the platform?',                                             a: 'Employees can verify dietitian credentials, moderate reported blog content, and communicate via the support & team board — all scoped to your organization.' },
    { q: 'Can I control what employees can access?',                                           a: "Employee access is tied to your organization's verification status. If your organization is pending or rejected, employees cannot perform sensitive tasks." },
    { q: 'How do I deactivate an employee?',                                                   a: 'In the Employee Management page, find the employee and click "Mark Inactive". They will no longer be able to log in until reactivated.' },
    { q: 'What is the difference between Employee Management and Employee Monitoring?',         a: 'Management handles CRUD — adding, editing, removing employees. Monitoring shows activity logs, task history, and performance data for your team.' },
  ];

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  return (
    <main className="flex-1">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#1A4A40] via-[#1E6F5C] to-[#27AE60] text-white py-24 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto flex flex-col-reverse md:flex-row gap-12 items-center">
          <div className="md:w-1/2 text-center md:text-left">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              <i className="fas fa-building"></i> Organization Dashboard
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">
              Welcome,<br /><span className="text-green-300">Organization Team!</span>
            </h1>
            <p className="text-white/80 text-lg mb-3 max-w-xl">
              Manage your team of employees, govern platform content, and maintain a trusted professional network on NutriConnect.
            </p>
            <p className="text-white/60 text-sm mb-8 max-w-xl">
              Operating on the <span className="text-green-300 font-semibold">Organization–Employee model</span> — you add and manage employees who carry out platform governance tasks under your oversight.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button onClick={() => navigate('/organization/employee-management')}
                className="bg-white text-[#1A4A40] font-bold py-3 px-7 rounded-full shadow-lg hover:bg-green-50 transition-all duration-300">
                <i className="fas fa-users-cog mr-2"></i>Manage Employees
              </button>
              <button onClick={() => navigate('/organization/employee-monitoring')}
                className="bg-white/10 border border-white/30 text-white font-bold py-3 px-7 rounded-full hover:bg-white/20 transition-all duration-300">
                <i className="fas fa-chart-bar mr-2"></i>Monitor Employees
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://img.freepik.com/free-vector/online-job-interview_23-2148613123.jpg?w=1380"
              alt="Organization Team"
              className="rounded-2xl shadow-2xl w-full max-w-md ring-4 ring-white/20 hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#27AE60] font-semibold uppercase tracking-wider text-sm mb-2">Two-Tier System</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-3">How the Organization–Employee Model Works</h2>
          <p className="text-gray-500 mb-14 text-lg">Full control over your team, from onboarding to oversight.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modelSteps.map((step, i) => (
              <div key={step.step} className="relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 text-left group">
                {i < modelSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-gray-200 z-10" />
                )}
                <div className="text-4xl font-black text-gray-100 mb-3 group-hover:text-green-100 transition-colors">{step.step}</div>
                <div className="text-2xl text-[#27AE60] mb-4"><i className={step.icon}></i></div>
                <h3 className="text-base font-bold text-[#1A4A40] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#27AE60] font-semibold uppercase tracking-wider text-sm mb-2">Jump Right In</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-3">Quick Access</h2>
          <p className="text-gray-500 mb-12 text-lg">Navigate directly to the most important areas of your dashboard.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((item, index) => (
              <button key={index} onClick={() => navigate(item.link)}
                className={`group relative bg-gradient-to-br ${item.gradient} rounded-2xl p-8 text-white text-left shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden`}>
                <div className="absolute right-4 bottom-4 text-white/10 text-8xl group-hover:text-white/20 transition-colors pointer-events-none">
                  <i className={item.icon}></i>
                </div>
                <div className="text-4xl mb-4 text-white/90"><i className={item.icon}></i></div>
                <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-white/70 mb-5">{item.subtitle}</p>
                <span className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors">
                  Open <i className="fas fa-arrow-right text-xs"></i>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE DUTIES ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#27AE60] font-semibold uppercase tracking-wider text-sm mb-2">Responsibilities</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40] mb-3">Core Duties</h2>
          <p className="text-gray-500 mb-12 text-lg">All areas of responsibility you manage as an organization.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dutyItems.map((item, index) => (
              <div key={index} onClick={() => navigate(item.route)}
                className={`bg-white p-7 rounded-2xl shadow-sm border border-gray-100 border-b-4 ${item.accent} cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${item.hover} text-left`}>
                <div className={`text-4xl ${item.iconColor} mb-4`}><i className={item.icon}></i></div>
                <h3 className="text-base font-bold text-[#1A4A40] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.text}</p>
                <span className={`text-sm font-semibold ${item.iconColor} flex items-center gap-1`}>
                  Go <i className="fas fa-chevron-right text-xs"></i>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#27AE60] font-semibold uppercase tracking-wider text-sm mb-2">Got Questions?</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A4A40]">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${openFaq === index ? 'border-[#27AE60] shadow-md' : 'border-gray-200 bg-white'}`}>
                <button onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-4 font-semibold text-[#1A4A40] flex justify-between items-center gap-4 hover:bg-green-50 transition-colors">
                  <span>{faq.q}</span>
                  <i className={`fas fa-chevron-down text-[#27AE60] transition-transform duration-300 shrink-0 ${openFaq === index ? 'rotate-180' : ''}`}></i>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER STRIP ──────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#1A4A40] to-[#27AE60] text-white text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to manage your team?</h2>
        <p className="text-white/70 mb-8 text-lg">Start by adding your first employee or reviewing pending verifications.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate('/organization/employee-management')}
            className="bg-white text-[#1A4A40] font-bold py-3 px-8 rounded-full shadow hover:bg-green-50 transition-all duration-300">
            <i className="fas fa-users-cog mr-2"></i>Employee Management
          </button>
          <button onClick={() => navigate('/organization/verify-dietitian')}
            className="bg-white/10 border border-white/30 text-white font-bold py-3 px-8 rounded-full hover:bg-white/20 transition-all duration-300">
            <i className="fas fa-user-check mr-2"></i>Verify Dietitians
          </button>
        </div>
      </section>

    </main>
  );
};

export default OrganizationHome;
