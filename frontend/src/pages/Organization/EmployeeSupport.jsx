import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const CATEGORIES = [
  { value: 'verification', label: 'Verification Issue', icon: 'fas fa-user-check', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-300' },
  { value: 'blog', label: 'Blog / Content Issue', icon: 'fas fa-flag', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-300' },
  { value: 'team', label: 'Internal Team Query', icon: 'fas fa-users', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300' },
  { value: 'general', label: 'General / Other', icon: 'fas fa-question-circle', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-300' },
];

const EmployeeSupport = () => {
  const token = localStorage.getItem('authToken_employee');

  // Read from localStorage as initial values, then refresh from API
  const _stored = JSON.parse(localStorage.getItem('authUser_employee') || '{}');
  const [empName, setEmpName] = useState(_stored.name || 'Employee');
  const [empEmail, setEmpEmail] = useState(_stored.email || '');
  const [orgName, setOrgName] = useState(_stored.org_name || 'Organization');

  // Reactive key so it always reflects the latest email (even if empty on first render)
  const QUERIES_KEY = empEmail ? `emp_queries_${empEmail}` : null;

  const [activeTab, setActiveTab] = useState('submit');

  // ── Submit Query ──
  const [form, setForm] = useState({ category: 'verification', subject: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // ── My Queries ──
  const [myQueries, setMyQueries] = useState([]);
  const [replies, setReplies] = useState({});

  // ── Team Board ──
  const [boardMsg, setBoardMsg] = useState('');
  const [boardPosts, setBoardPosts] = useState([]);
  const [boardError, setBoardError] = useState('');
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardPosting, setBoardPosting] = useState(false);
  const boardMessagesRef = useRef(null);
  const pageRef = useRef(null);
  const [userColorMap, setUserColorMap] = useState({});
  
  // Track login time to filter new messages
  const [loginTime] = useState(() => {
    const stored = localStorage.getItem('emp_loginTime');
    if (stored) {
      return new Date(stored);
    }
    const now = new Date();
    localStorage.setItem('emp_loginTime', now.toISOString());
    return now;
  });

  // Color palette for different users
  const COLORS = [
    { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-900' },
    { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-900' },
    { bg: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-900' },
    { bg: 'bg-indigo-500', light: 'bg-indigo-100', text: 'text-indigo-900' },
    { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-900' },
    { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-900' },
    { bg: 'bg-cyan-500', light: 'bg-cyan-100', text: 'text-cyan-900' },
    { bg: 'bg-fuchsia-500', light: 'bg-fuchsia-100', text: 'text-fuchsia-900' },
  ];

  // Get consistent color for a user based on email
  const getUserColor = (email) => {
    if (!userColorMap[email]) {
      const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const colorIndex = hash % COLORS.length;
      setUserColorMap(prev => ({ ...prev, [email]: COLORS[colorIndex] }));
      return COLORS[colorIndex];
    }
    return userColorMap[email];
  };

  // Always fetch fresh user details on mount so name is never stale
  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await axios.get('/api/getorganizationdetails', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const { name, email, org_name } = res.data;
          if (name)     setEmpName(name);
          if (email)    setEmpEmail(email);
          if (org_name) setOrgName(org_name);
          // Update localStorage so other components stay in sync
          const updated = { ..._stored, name, email, org_name };
          localStorage.setItem('authUser_employee', JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Failed to refresh user details:', err);
      }
    };
    refreshUser();
  }, [token, _stored]);

  const fetchBoardPosts = useCallback(async (silent = false) => {
    if (!silent) setBoardLoading(true);
    try {
      const res = await axios.get(`/api/teamboard?orgName=${encodeURIComponent(orgName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoardPosts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch board posts:', err);
    } finally {
      if (!silent) setBoardLoading(false);
    }
  }, [orgName, token]);

  // Fetch admin replies to employee queries
  const fetchReplies = useCallback(async () => {
    if (!empEmail) return;
    try {
      const res = await axios.get(`/api/contact/queries-list?email=${encodeURIComponent(empEmail.toLowerCase())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.data) {
        const repliesMap = {};
        res.data.data.forEach(query => {
          // Extract subject from query format [Category] subject
          const queryContent = query.query || '';
          const catMatch = queryContent.match(/^\[([^\]]+)\]\s*(.+?)(?:\n|$)/);
          const subject = catMatch ? catMatch[2].trim() : queryContent.split('\n')[0].trim();
          // Match by email + subject (normalize email to lowercase)
          const queryKey = `${query.email.toLowerCase()}_${subject}`;
          if (query.admin_reply) {
            repliesMap[queryKey] = {
              _id: query._id,
              reply: query.admin_reply,
              replied_at: query.replied_at,
              emp_reply: query.emp_reply || null,
              emp_replied_at: query.emp_replied_at || null
            };
          }
        });
        setReplies(repliesMap);
      }
    } catch (err) {
      console.error('Failed to fetch replies:', err);
    }
  }, [empEmail, token]);

  useEffect(() => {
    if (!QUERIES_KEY) return;
    const stored = JSON.parse(localStorage.getItem(QUERIES_KEY) || '[]');
    setMyQueries(stored);
    fetchReplies();
    fetchBoardPosts();
    // Auto-refresh board every 15 seconds
    const boardInterval = setInterval(() => fetchBoardPosts(true), 15000);
    // Auto-refresh replies every 5 seconds to show new admin responses
    const repliesInterval = setInterval(() => fetchReplies(), 5000);
    return () => {
      clearInterval(boardInterval);
      clearInterval(repliesInterval);
    };
  }, [orgName, empEmail, QUERIES_KEY, fetchBoardPosts, fetchReplies]);

  // Auto-scroll to bottom when new messages arrive or when switching to board tab
  useEffect(() => {
    if (boardMessagesRef.current) {
      setTimeout(() => {
        boardMessagesRef.current.scrollTop = boardMessagesRef.current.scrollHeight;
      }, 50);
    }
  }, [boardPosts, activeTab]);

  // ── Validate form ──
  const validate = () => {
    const errs = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.message.trim() || form.message.trim().length < 10)
      errs.message = 'Message must be at least 10 characters';
    return errs;
  };

  // ── Submit query to contact API ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSubmitting(true);
    const catLabel = CATEGORIES.find(c => c.value === form.category)?.label || 'General';
    const payload = {
      name: empName,
      email: empEmail,
      role: 'Others',
      query: `[${catLabel}] ${form.subject.trim()}\n\n${form.message.trim()}`,
    };
    try {
      await axios.post('/api/contact/submit', payload);
      const entry = {
        id: Date.now(),
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      if (QUERIES_KEY) {
        const updated = [entry, ...myQueries];
        setMyQueries(updated);
        localStorage.setItem(QUERIES_KEY, JSON.stringify(updated));
      }
      setForm({ category: 'verification', subject: '', message: '' });
      setSubmitSuccess('Query submitted successfully! You will receive a confirmation email shortly.');
      setTimeout(() => setSubmitSuccess(''), 6000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit query. Please try again.');
      setTimeout(() => setSubmitError(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Team board post ──
  const handleBoardPost = async () => {
    if (!boardMsg.trim()) { setBoardError('Message cannot be empty'); return; }
    setBoardError('');
    setBoardPosting(true);
    try {
      const res = await axios.post('/api/teamboard', {
        orgName,
        author: empName,
        email: empEmail,
        message: boardMsg.trim(),
        isOrg: false,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBoardPosts(prev => [res.data.data, ...prev]);
      setBoardMsg('');
    } catch (err) {
      setBoardError(err.response?.data?.message || 'Failed to post message.');
    } finally {
      setBoardPosting(false);
    }
  };

  const handleDeleteBoardPost = async (id) => {
    try {
      await axios.delete(`/api/teamboard/${id}?email=${encodeURIComponent(empEmail)}&isOrg=false`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoardPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const catInfo = (val) => CATEGORIES.find(c => c.value === val);

  // Count only pending queries (not resolved)
  const pendingCount = myQueries.filter(q => {
    const queryKey = `${empEmail.toLowerCase()}_${q.subject.trim()}`;
    const reply = replies[queryKey];
    return !reply?.reply; // Only count if no admin reply
  }).length;

  // Count only new team board messages (created after login)
  const newMessageCount = boardPosts.filter(post => {
    const postTime = new Date(post.created_at);
    return postTime > loginTime;
  }).length;

  const tabs = [
    { key: 'submit', label: 'Submit Query', icon: 'fas fa-paper-plane' },
    { key: 'myqueries', label: `My Queries${pendingCount > 0 ? ` (${pendingCount})` : ''}`, icon: 'fas fa-list-alt' },
    { key: 'board', label: `Team Board${newMessageCount > 0 ? ` (${newMessageCount})` : ''}`, icon: 'fas fa-comments' },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A4A40] to-[#27AE60] rounded-2xl p-7 mb-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-1">
            <i className="fas fa-headset mr-3"></i>Employee Support
          </h1>
          <p className="text-green-100">Raise queries, report issues, or collaborate with your team — all in one place.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-[#27AE60] text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Submit Query ── */}
        {activeTab === 'submit' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-[#1A4A40] mb-6">
              <i className="fas fa-paper-plane mr-2 text-[#27AE60]"></i>Raise a New Que5060ry
            </h2>

            {submitSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-5 rounded">
                <i className="fas fa-check-circle mr-2"></i>{submitSuccess}
              </div>
            )}
            {submitError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-5 rounded">
                <i className="fas fa-exclamation-circle mr-2"></i>{submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                        form.category === cat.value
                          ? `${cat.bg} ${cat.color} shadow-sm`
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <i className={`${cat.icon} text-xl`}></i>
                      <span className="text-center leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all ${
                    formErrors.subject ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {formErrors.subject && <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your issue or query in detail..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all resize-none ${
                    formErrors.message ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {formErrors.message && <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>}
                <p className="text-xs text-gray-400 mt-1">Submitting as: <strong>{empName}</strong> ({empEmail})</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#27AE60] hover:bg-[#1E6F5C] text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md disabled:opacity-50"
                >
                  {submitting
                    ? <><i className="fas fa-spinner fa-spin mr-2"></i>Submitting...</>
                    : <><i className="fas fa-paper-plane mr-2"></i>Submit Query</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'myqueries' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#1A4A40]">
                <i className="fas fa-list-alt mr-2 text-[#27AE60]"></i>My Submitted Queries
              </h2>
            </div>
            {myQueries.length === 0 ? (
              <div className="text-center py-16">
                <i className="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No queries submitted yet.</p>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="mt-4 text-[#27AE60] font-semibold hover:underline text-sm"
                >
                  Submit your first query →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {myQueries.map(q => {
                  const cat = catInfo(q.category);
                  // Create matching key for replies lookup (lowercase email, trim subject)
                  const queryKey = `${empEmail.toLowerCase()}_${q.subject.trim()}`;
                  const reply = replies[queryKey];
                  const isResolved = !!reply?.reply;
                  return (
                    <div key={q.id} className="p-6 hover:bg-gray-50 transition-colors">
                      {/* Query Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cat?.bg || 'bg-gray-100'}`}>
                            <i className={`${cat?.icon} ${cat?.color} text-sm`}></i>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">{q.subject}</p>
                            <p className="text-sm text-gray-600 mt-1">{q.message}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat?.bg} ${cat?.color}`}>
                                {cat?.label}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(q.submittedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                          isResolved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {isResolved ? <><i className="fas fa-check-circle mr-1"></i>Resolved</> : <><i className="fas fa-clock mr-1"></i>Pending</> }
                        </span>
                      </div>

                      {/* Admin Reply Section */}
                      {reply?.reply && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-4">
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            <i className="fas fa-check-circle text-green-600 mr-2"></i>Reply from Admin:
                          </p>
                          <p className="text-gray-700 text-sm leading-relaxed mb-2">{reply.reply}</p>
                          <p className="text-xs text-gray-500">
                            <i className="fas fa-clock mr-1"></i>
                            {new Date(reply.replied_at).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Employee Reply History */}
                      {reply?.emp_reply && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            <i className="fas fa-reply text-blue-600 mr-2"></i>Your Response:
                          </p>
                          <p className="text-gray-700 text-sm leading-relaxed mb-2">{reply.emp_reply}</p>
                          <p className="text-xs text-gray-500">
                            <i className="fas fa-clock mr-1"></i>
                            {new Date(reply.emp_replied_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Team Board ── */}
        {activeTab === 'board' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#1A4A40]">
                <i className="fas fa-comments mr-2 text-[#27AE60]"></i>Team Board
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Share notes, updates, or questions with fellow employees in <strong>{orgName}</strong>.
              </p>
            </div>

            {/* Compose */}
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-[#27AE60] flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">
                  {empName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    rows={3}
                    value={boardMsg}
                    onChange={e => setBoardMsg(e.target.value)}
                    placeholder="Post a message to your team..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all resize-none bg-white text-sm"
                  />
                  {boardError && <p className="text-red-500 text-xs mt-1">{boardError}</p>}
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleBoardPost}
                      disabled={boardPosting}
                      className="bg-[#27AE60] hover:bg-[#1E6F5C] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {boardPosting
                        ? <><i className="fas fa-spinner fa-spin mr-2"></i>Posting...</>
                        : <><i className="fas fa-paper-plane mr-2"></i>Post</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            {boardLoading ? (
              <div className="text-center py-14">
                <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-3"></i>
                <p className="text-gray-400 text-sm">Loading messages...</p>
              </div>
            ) : boardPosts.length === 0 ? (
              <div className="text-center py-14">
                <i className="fas fa-comments text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No messages yet. Be the first to post!</p>
              </div>
            ) : (
              <div ref={boardMessagesRef} className="flex flex-col gap-3 p-5 h-[40vh] overflow-y-auto scroll-smooth">
                {[...boardPosts].reverse().map(post => {
                  const isAdmin = post.isOrg === true;
                  const isMine = post.email === empEmail;
                  const userColor = isAdmin ? { bg: 'bg-[#27AE60]', light: 'bg-green-200' } : getUserColor(post.email);
                  const messageBg = isMine
                    ? `${isAdmin ? 'bg-[#27AE60]' : userColor.bg} text-white`
                    : userColor.light;
                  const messageTextColor = isMine ? 'text-white' : userColor.text;
                  return (
                    <div key={post._id} className={`flex items-end gap-2 group ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full ${isAdmin ? 'bg-[#27AE60]' : userColor.bg} flex items-center justify-center text-white font-bold flex-shrink-0 text-xs`}>
                        {isAdmin ? <i className="fas fa-building"></i> : post.author.charAt(0).toUpperCase()}
                      </div>
                      {/* Bubble */}
                      <div className={`max-w-[70%] flex flex-col gap-1 ${isAdmin ? 'items-start' : 'items-end'}`}>
                        {/* Name + badge */}
                        <div className="flex items-center gap-1.5 px-1">
                          <span className="text-xs font-semibold text-gray-700">{post.author}</span>
                          {isAdmin && (
                            <span className="text-[10px] bg-[#27AE60] text-white px-1.5 py-0.5 rounded-full font-medium">Admin</span>
                          )}
                        </div>
                        <div className={`relative px-5 py-3 rounded-2xl text-base leading-relaxed whitespace-pre-wrap shadow-sm ${messageBg} ${messageTextColor} ${isAdmin ? 'rounded-bl-sm' : 'rounded-br-sm'}`}>
                          {post.message}
                        </div>
                        {/* Time + delete */}
                        <div className={`flex items-center gap-2 px-1 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                          <span className="text-[10px] text-gray-400">
                            {new Date(post.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            <button
                              onClick={() => handleDeleteBoardPost(post._id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                              title="Delete"
                            >
                              <i className="fas fa-trash text-[10px]"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeSupport;
