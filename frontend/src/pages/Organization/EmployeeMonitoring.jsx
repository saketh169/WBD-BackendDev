import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const EmployeeMonitoring = () => {
    const [stats, setStats] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    
    // Refs for scrolling chat containers
    const queriesContainerRef = useRef(null);
    const resolvedContainerRef = useRef(null);
    const boardContainerRef = useRef(null);

    // Org auth
    const authOrg = JSON.parse(localStorage.getItem('authUser_organization') || '{}');
    const orgName = authOrg.org_name || 'Organization';

    // Team Board state
    const [boardPosts, setBoardPosts] = useState([]);
    const [boardMsg, setBoardMsg] = useState('');
    const [boardError, setBoardError] = useState('');
    const [boardLoading, setBoardLoading] = useState(false);
    const [boardPosting, setBoardPosting] = useState(false);

    // Pending employee queries state
    const [pendingQueries, setPendingQueries] = useState([]);
    const [queriesLoading, setQueriesLoading] = useState(false);

    // Resolved queries state with pagination
    const [allQueries, setAllQueries] = useState([]);
    const [resolvedPage, setResolvedPage] = useState(1);
    const itemsPerPage = 10;

    // Query reply state
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchEmployees();
        fetchBoardPosts();
        fetchEmployeeQueries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Auto-refresh board every 15 seconds
        // Using empty dependency array as functions are defined in component
        const interval = setInterval(() => {
            fetchBoardPostsSilent();
        }, 15000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-scroll chat containers to bottom when new data arrives
    useEffect(() => {
        if (queriesContainerRef.current) {
            setTimeout(() => {
                queriesContainerRef.current.scrollTop = queriesContainerRef.current.scrollHeight;
            }, 100);
        }
    }, [pendingQueries]);

    // Auto-scroll resolved queries container
    useEffect(() => {
        if (resolvedContainerRef.current) {
            setTimeout(() => {
                resolvedContainerRef.current.scrollTop = resolvedContainerRef.current.scrollHeight;
            }, 100);
        }
    }, [resolvedPage, allQueries]);

    // Auto-scroll team board container
    useEffect(() => {
        if (boardContainerRef.current) {
            setTimeout(() => {
                boardContainerRef.current.scrollTop = boardContainerRef.current.scrollHeight;
            }, 100);
        }
    }, [boardPosts]);

    // Fetch employee statistics
    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken_organization');
            const response = await axios.get(`/api/employees/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all employees
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken_organization');
            const response = await axios.get(`/api/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch team board posts from API
    const fetchBoardPosts = async () => {
        setBoardLoading(true);
        try {
            const token = localStorage.getItem('authToken_organization');
            const res = await axios.get(`/api/teamboard?orgName=${encodeURIComponent(orgName)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBoardPosts(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch board posts:', err);
        } finally {
            setBoardLoading(false);
        }
    };

    // Silent refresh (no loading spinner flicker)
    const fetchBoardPostsSilent = async () => {
        try {
            const token = localStorage.getItem('authToken_organization');
            const res = await axios.get(`/api/teamboard?orgName=${encodeURIComponent(orgName)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBoardPosts(res.data.data || []);
        } catch (error) {
            console.error('Error fetching board posts:', error);
        }
    };

    // Fetch pending employee queries from API
    const fetchEmployeeQueries = async () => {
        setQueriesLoading(true);
        try {
            const token = localStorage.getItem('authToken_organization');
            const res = await axios.get('/api/contact/employee-queries', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPendingQueries(res.data.data || []);
            
            // Also fetch all queries for resolved list
            const allRes = await axios.get('/api/contact/queries-list', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const allQueryData = allRes.data.data || [];
            // Sort by created_at descending (latest first)
            allQueryData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAllQueries(allQueryData);
            setResolvedPage(1); // Reset to first page
        } catch (err) {
            console.error('Failed to fetch employee queries:', err);
            setPendingQueries([]);
            setAllQueries([]);
        } finally {
            setQueriesLoading(false);
        }
    };

    // Team Board handlers
    const handleBoardPost = async () => {
        if (!boardMsg.trim()) { setBoardError('Message cannot be empty'); return; }
        setBoardError('');
        setBoardPosting(true);
        try {
            const token = localStorage.getItem('authToken_organization');
            const res = await axios.post('/api/teamboard', {
                orgName,
                author: authOrg.name || orgName,
                email: authOrg.email || '',
                message: boardMsg.trim(),
                isOrg: true,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setBoardPosts(prev => [res.data.data, ...prev]);
            setBoardMsg('');
        } catch (err) {
            setBoardError(err.response?.data?.message || 'Failed to post message.');
        } finally {
            setBoardPosting(false);
        }
    };

    const handleDeletePost = async (id) => {
        try {
            const token = localStorage.getItem('authToken_organization');
            await axios.delete(`/api/teamboard/${id}?email=${encodeURIComponent(authOrg.email || '')}&isOrg=true`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBoardPosts(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            console.error('Failed to delete post:', err);
        }
    };

    // Today's work: read each employee's query history from localStorage
    const todayStr = new Date().toDateString();

    // Employees who logged in today
    const loggedInToday = (employees || []).filter(emp => {
        if (!emp.lastLogin) return false;
        return new Date(emp.lastLogin).toDateString() === todayStr;
    });

    // Filter employees based on status, sort by most recent login
    const filteredEmployees = (employees || [])
        .filter(emp => filter === 'all' || emp.status === filter)
        .sort((a, b) => {
            if (!a.lastLogin && !b.lastLogin) return 0;
            if (!a.lastLogin) return 1;
            if (!b.lastLogin) return -1;
            return new Date(b.lastLogin) - new Date(a.lastLogin);
        });

    // Handle reply to query
    const handleSendReply = async (queryId) => {
        if (!replyText.trim()) {
            alert('Please enter a reply.');
            return;
        }

        setIsSendingReply(true);
        try {
            const token = localStorage.getItem('authToken_organization');
            const response = await axios.post(
                '/api/contact/reply',
                { queryId, replyMessage: replyText },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Remove the query from pending list since it's now replied
                setPendingQueries(prevActivities =>
                    prevActivities.filter(q => q._id !== queryId)
                );
                alert('Reply sent successfully!');
                setReplyingTo(null);
                setReplyText('');
            }
        } catch (err) {
            console.error('Error sending reply:', err);
            alert('Failed to send reply. Please try again.');
        } finally {
            setIsSendingReply(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-[#1A4A40] mb-2">
                        <i className="fas fa-chart-line mr-3"></i>
                        Staff Overview
                    </h1>
                    <p className="text-gray-600">Track employee activity, performance, team board and today's work</p>
                </div>

                {loading && !stats ? (
                    <div className="text-center py-12">
                        <i className="fas fa-spinner fa-spin text-4xl text-[#27AE60]"></i>
                        <p className="mt-4 text-gray-600">Loading statistics...</p>
                    </div>
                ) : (
                    <>
                        {/* ── TODAY'S WORK ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                            {/* Logged In Today */}
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-5 border-b border-gray-200 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <i className="fas fa-sign-in-alt text-emerald-600"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-[#1A4A40]">Logged In Today</h2>
                                        <p className="text-xs text-gray-400">{new Date().toDateString()}</p>
                                    </div>
                                    <span className="ml-auto bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full">
                                        {loggedInToday.length}
                                    </span>
                                </div>
                                {loggedInToday.length === 0 ? (
                                    <div className="text-center py-10">
                                        <i className="fas fa-moon text-3xl text-gray-300 mb-3"></i>
                                        <p className="text-gray-400 text-sm">No employees logged in today yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {loggedInToday.map(emp => (
                                            <div key={emp._id} className="flex items-center gap-3 px-5 py-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#27AE60] to-[#1E6F5C] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{emp.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                                                </div>
                                                <span className="text-xs text-gray-400 flex-shrink-0">
                                                    {new Date(emp.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Queries / Activity submitted today */}
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-5 border-b border-gray-200 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                        <i className="fas fa-tasks text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-[#1A4A40]">Pending Employee Queries</h2>
                                        <p className="text-xs text-gray-400">Queries submitted by employees awaiting response</p>
                                    </div>
                                    <span className="ml-auto bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                                        {pendingQueries.length}
                                    </span>
                                </div>
                                {queriesLoading ? (
                                    <div className="text-center py-10">
                                        <i className="fas fa-spinner fa-spin text-2xl text-gray-300 mb-3"></i>
                                        <p className="text-gray-400 text-sm">Loading queries...</p>
                                    </div>
                                ) : pendingQueries.length === 0 ? (
                                    <div className="text-center py-10">
                                        <i className="fas fa-inbox text-3xl text-gray-300 mb-3"></i>
                                        <p className="text-gray-400 text-sm">No pending queries</p>
                                    </div>
                                ) : (
                                    <div ref={queriesContainerRef} className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                                        {pendingQueries.map(q => {
                                            const queryText = q.query || '';
                                            // Extract category from query format: "[Category] subject"
                                            const catMatch = queryText.match(/^\[([^\]]+)\]\s*(.+?)(?:\n|$)/);
                                            const catLabel = catMatch ? catMatch[1] : 'General';
                                            const subject = catMatch ? catMatch[2] : queryText.split('\n')[0];
                                            return (
                                                <div key={q._id} className="px-5 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <i className="fas fa-comment-dots text-blue-600 text-xs"></i>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 text-sm truncate">{subject}</p>
                                                            <p className="text-xs text-gray-500 truncate">by {q.empName || q.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{catLabel}</span>
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                            q.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {q.status}
                                                        </span>
                                                    </div>

                                                    {/* Reply composition */}
                                                    {q.status === 'pending' && (
                                                        <div className="mt-3 ml-11">
                                                            {replyingTo === q._id ? (
                                                                <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                                                                    <h4 className="font-medium text-gray-900 mb-2 text-xs">
                                                                        <i className="fas fa-reply mr-2 text-blue-600"></i>
                                                                        Compose Reply:
                                                                    </h4>
                                                                    <textarea
                                                                        value={replyText}
                                                                        onChange={(e) => setReplyText(e.target.value)}
                                                                        placeholder="Type your reply here..."
                                                                        className="w-full p-2 border border-gray-300 rounded-lg resize-vertical min-h-16 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                                                        disabled={isSendingReply}
                                                                    />
                                                                    <div className="flex gap-2 mt-2">
                                                                        <button
                                                                            onClick={() => handleSendReply(q._id)}
                                                                            disabled={isSendingReply || !replyText.trim()}
                                                                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                                        >
                                                                            {isSendingReply ? (
                                                                                <><i className="fas fa-spinner fa-spin"></i></>
                                                                            ) : (
                                                                                <><i className="fas fa-paper-plane"></i>Send</>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setReplyingTo(null);
                                                                                setReplyText('');
                                                                            }}
                                                                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-gray-50 transition"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setReplyingTo(q._id)}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
                                                                >
                                                                    <i className="fas fa-reply mr-1"></i>Reply
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── RESOLVED QUERIES (WITH PAGINATION) ── */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                            <div className="p-5 border-b border-gray-200 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                                    <i className="fas fa-check-circle text-green-600"></i>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#1A4A40]">Resolved Queries</h2>
                                    <p className="text-xs text-gray-400">Queries with admin replies</p>
                                </div>
                            </div>
                            {queriesLoading ? (
                                <div className="text-center py-10">
                                    <i className="fas fa-spinner fa-spin text-2xl text-gray-300 mb-3"></i>
                                    <p className="text-gray-400 text-sm">Loading resolved queries...</p>
                                </div>
                            ) : (() => {
                                const resolvedQueries = allQueries.filter(q => q.admin_reply && q.status === 'replied');
                                if (resolvedQueries.length === 0) {
                                    return (
                                        <div className="text-center py-10">
                                            <i className="fas fa-check-double text-3xl text-gray-300 mb-3"></i>
                                            <p className="text-gray-400 text-sm">No resolved queries yet</p>
                                        </div>
                                    );
                                }
                                
                                const totalPages = Math.ceil(resolvedQueries.length / itemsPerPage);
                                const startIdx = (resolvedPage - 1) * itemsPerPage;
                                const paginatedQueries = resolvedQueries.slice(startIdx, startIdx + itemsPerPage);
                                
                                return (
                                    <>
                                        <div ref={resolvedContainerRef} className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                            {paginatedQueries.map(q => {
                                                const queryText = q.query || '';
                                                const catMatch = queryText.match(/^\[([^\]]+)\]\s*(.+?)(?:\n|$)/);
                                                const catLabel = catMatch ? catMatch[1] : 'General';
                                                const subject = catMatch ? catMatch[2] : queryText.split('\n')[0];
                                                return (
                                                    <div key={q._id} className="px-5 py-4 hover:bg-gray-50 transition">
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <i className="fas fa-check-circle text-green-600 text-xs"></i>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 text-sm truncate">{subject}</p>
                                                                <p className="text-xs text-gray-500 truncate">by {q.empName || q.name}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">{catLabel}</span>
                                                                    <span className="text-xs text-gray-400">
                                                                        {new Date(q.created_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">
                                                                Resolved
                                                            </span>
                                                        </div>
                                                        {/* Show reply */}
                                                        {q.admin_reply && (
                                                            <div className="ml-11 bg-green-50 border-l-4 border-green-400 p-3 rounded text-sm">
                                                                <p className="font-semibold text-gray-900 text-xs mb-1">
                                                                    <i className="fas fa-check text-green-600 mr-1"></i>Admin Reply:
                                                                </p>
                                                                <p className="text-gray-700 text-xs">{q.admin_reply}</p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {new Date(q.replied_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between">
                                                <p className="text-sm text-gray-600">
                                                    Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, resolvedQueries.length)} of {resolvedQueries.length}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setResolvedPage(prev => Math.max(1, prev - 1))}
                                                        disabled={resolvedPage === 1}
                                                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                    >
                                                        <i className="fas fa-chevron-left"></i>
                                                    </button>
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                        <button
                                                            key={page}
                                                            onClick={() => setResolvedPage(page)}
                                                            className={`px-3 py-1 text-sm rounded font-medium transition ${
                                                                resolvedPage === page
                                                                    ? 'bg-[#27AE60] text-white'
                                                                    : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => setResolvedPage(prev => Math.min(totalPages, prev + 1))}
                                                        disabled={resolvedPage === totalPages}
                                                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                    >
                                                        <i className="fas fa-chevron-right"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* ── TEAM BOARD (ORG VIEW) ── */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-[#1A4A40]">
                                    <i className="fas fa-comments mr-2 text-[#27AE60]"></i>Team Board
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    View messages from your team and respond as admin. Shared with all employees of <strong>{orgName}</strong>.
                                </p>
                            </div>

                            {/* Compose as org */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <div className="flex gap-3 items-start">
                                    <div className="w-9 h-9 rounded-full bg-[#1A4A40] flex items-center justify-center text-white font-bold flex-shrink-0 mt-1 text-sm">
                                        <i className="fas fa-building"></i>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            rows={3}
                                            value={boardMsg}
                                            onChange={e => setBoardMsg(e.target.value)}
                                            placeholder={`Post an announcement or reply to your team...`}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all resize-none bg-white text-sm"
                                        />
                                        {boardError && <p className="text-red-500 text-xs mt-1">{boardError}</p>}
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={handleBoardPost}
                                                disabled={boardPosting}
                                                className="bg-[#1A4A40] hover:bg-[#27AE60] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                            >
                                                {boardPosting
                                                    ? <><i className="fas fa-spinner fa-spin mr-2"></i>Posting...</>
                                                    : <><i className="fas fa-paper-plane mr-2"></i>Post as Admin</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Board posts */}
                            {boardLoading ? (
                                <div className="text-center py-14">
                                    <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-3"></i>
                                    <p className="text-gray-400 text-sm">Loading board...</p>
                                </div>
                            ) : boardPosts.length === 0 ? (
                                <div className="text-center py-14">
                                    <i className="fas fa-comments text-5xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500">No messages on the board yet.</p>
                                </div>
                            ) : (
                                <div ref={boardContainerRef} className="flex flex-col gap-3 p-5 h-[50vh] overflow-y-auto scroll-smooth">
                                    {[...boardPosts].reverse().map(post => {
                                        const isMine = post.isOrg === true;
                                        return (
                                            <div key={post._id} className={`flex items-end gap-2 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {/* Avatar (only for others) */}
                                                {!isMine && (
                                                    <div className="w-8 h-8 rounded-full bg-[#27AE60] flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                                                        {post.author.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                {/* Bubble */}
                                                <div className={`max-w-[70%] flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
                                                    {/* Name (only for others) */}
                                                    {!isMine && (
                                                        <span className="text-xs font-semibold text-gray-700 px-1">{post.author}</span>
                                                    )}
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                                                        isMine
                                                            ? 'bg-[#27AE60] text-white rounded-br-sm'
                                                            : 'bg-green-200 text-green-900 rounded-bl-sm'
                                                    }`}>
                                                        {post.message}
                                                    </div>
                                                    {/* Time + delete */}
                                                    <div className={`flex items-center gap-2 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(post.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeletePost(post._id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                                                            title="Delete"
                                                        >
                                                            <i className="fas fa-trash text-[10px]"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Filter by Status
                                    </label>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#27AE60] focus:border-transparent"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active Only</option>
                                        <option value="inactive">Inactive Only</option>
                                        <option value="pending-activation">Pending Only</option>
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[200px] flex items-end">
                                    <button
                                        onClick={() => { setFilter('all'); fetchEmployees(); fetchStats(); fetchEmployeeQueries(); fetchBoardPosts(); }}
                                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <i className="fas fa-redo mr-2"></i>Reset & Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Employee Activity Table */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-[#1A4A40]">
                                    Employee Activity Log ({filteredEmployees.length})
                                </h2>
                                <button
                                    onClick={fetchEmployees}
                                    className="px-4 py-2 bg-[#27AE60] text-white rounded-lg hover:bg-[#1E6F5C] transition-colors"
                                >
                                    <i className="fas fa-sync-alt mr-2"></i>Refresh
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <i className="fas fa-spinner fa-spin text-4xl text-[#27AE60]"></i>
                                    <p className="mt-4 text-gray-600">Loading employees...</p>
                                </div>
                            ) : filteredEmployees.length === 0 ? (
                                <div className="text-center py-12">
                                    <i className="fas fa-filter text-6xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500 text-lg">No employees match the selected filters</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-green-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Employee</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">License</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Last Login</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-[#1A4A40] uppercase tracking-wider">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredEmployees.map((employee) => (
                                                <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#27AE60] to-[#1E6F5C] rounded-full flex items-center justify-center text-white font-bold">
                                                                {employee.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="font-medium text-gray-900">{employee.name}</div>
                                                                <div className="text-sm text-gray-500">{employee.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-mono">
                                                            {employee.licenseNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center ${
                                                            employee.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            employee.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            <span className={`w-2 h-2 rounded-full mr-2 ${
                                                                employee.status === 'active' ? 'bg-green-500' :
                                                                employee.status === 'inactive' ? 'bg-red-500' :
                                                                'bg-yellow-500'
                                                            }`}></span>
                                                            {employee.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {employee.lastLogin ? (
                                                            <div>
                                                                <div>{formatDate(employee.lastLogin)}</div>
                                                                {new Date(employee.lastLogin).toDateString() === todayStr && (
                                                                    <span className="text-xs text-emerald-600 font-semibold">● Today</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Never</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(employee.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default EmployeeMonitoring;
