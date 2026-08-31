const { useState, useEffect, useMemo, useRef } = React;

const initialData = {
    subjects: [
        { id: 1, name: "JavaScript", teacher: "Mr. Ahmed", progress: 78, color: "blue", hours: 14 },
        { id: 2, name: "Mathematics", teacher: "Ms. Sara", progress: 64, color: "cyan", hours: 11 },
        { id: 3, name: "Computer Science", teacher: "Mr. Hamza", progress: 86, color: "indigo", hours: 17 },
        { id: 4, name: "English", teacher: "Ms. Ayesha", progress: 71, color: "sky", hours: 8 }
    ],
    assignments: [
        { id: 1, title: "JavaScript DOM Project", subject: "JavaScript", due: "2026-09-03", priority: "High", completed: false },
        { id: 2, title: "Algebra Worksheet", subject: "Mathematics", due: "2026-09-02", priority: "Medium", completed: false },
        { id: 3, title: "Computer Architecture Report", subject: "Computer Science", due: "2026-09-05", priority: "High", completed: true },
        { id: 4, title: "English Essay", subject: "English", due: "2026-09-07", priority: "Low", completed: false }
    ],
    notes: [
        { id: 1, title: "JavaScript Promises", content: "Promises represent the eventual completion or failure of an asynchronous operation.", pinned: true, date: "Today" },
        { id: 2, title: "Math Formulas", content: "Review quadratic equations, factorization and exponent rules.", pinned: false, date: "Yesterday" },
        { id: 3, title: "Project Ideas", content: "Build an education platform with analytics and productivity tools.", pinned: true, date: "Aug 28" }
    ],
    sessions: [
        { day: "Mon", minutes: 95 },
        { day: "Tue", minutes: 130 },
        { day: "Wed", minutes: 80 },
        { day: "Thu", minutes: 145 },
        { day: "Fri", minutes: 110 },
        { day: "Sat", minutes: 170 },
        { day: "Sun", minutes: 125 }
    ],
    profile: {
        name: "Faizan",
        role: "Student Developer",
        goal: 180
    },
    settings: {
        dark: false,
        notifications: true
    }
};

function loadData() {
    try {
        const saved = localStorage.getItem("eduboard-pro");
        return saved ? JSON.parse(saved) : initialData;
    } catch {
        return initialData;
    }
}

function saveData(data) {
    localStorage.setItem("eduboard-pro", JSON.stringify(data));
}

function Icon({ name, size = 18, strokeWidth = 2 }) {
    return <i data-lucide={name} width={size} height={size} strokeWidth={strokeWidth}></i>;
}

function App() {
    const [data, setData] = useState(loadData);
    const [page, setPage] = useState("Dashboard");
    const [sidebar, setSidebar] = useState(false);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState("");
    const [pomodoro, setPomodoro] = useState(25 * 60);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerMode, setTimerMode] = useState("Focus");
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    useEffect(() => {
        saveData(data);
        document.documentElement.classList.toggle("dark", data.settings.dark);
        setTimeout(() => lucide.createIcons(), 50);
    }, [data, page, modal, notificationsOpen]);

    useEffect(() => {
        if (!timerRunning) return;

        const interval = setInterval(() => {
            setPomodoro(prev => {
                if (prev <= 1) {
                    setTimerRunning(false);
                    showToast("Focus session completed!");
                    return timerMode === "Focus" ? 5 * 60 : 25 * 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timerRunning, timerMode]);

    function showToast(message) {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    }

    function updateData(updates) {
        setData(prev => ({ ...prev, ...updates }));
    }

    function toggleTheme() {
        updateData({
            settings: {
                ...data.settings,
                dark: !data.settings.dark
            }
        });
    }

    function addAssignment(item) {
        updateData({
            assignments: [
                ...data.assignments,
                {
                    id: Date.now(),
                    title: item.title,
                    subject: item.subject,
                    due: item.due,
                    priority: item.priority,
                    completed: false
                }
            ]
        });
        setModal(null);
        showToast("Assignment added");
    }

    function addSubject(item) {
        updateData({
            subjects: [
                ...data.subjects,
                {
                    id: Date.now(),
                    name: item.name,
                    teacher: item.teacher,
                    progress: Number(item.progress),
                    color: "blue",
                    hours: 0
                }
            ]
        });
        setModal(null);
        showToast("Subject added");
    }

    function addNote(item) {
        updateData({
            notes: [
                ...data.notes,
                {
                    id: Date.now(),
                    title: item.title,
                    content: item.content,
                    pinned: false,
                    date: "Today"
                }
            ]
        });
        setModal(null);
        showToast("Note created");
    }

    function toggleAssignment(id) {
        updateData({
            assignments: data.assignments.map(a =>
                a.id === id ? { ...a, completed: !a.completed } : a
            )
        });
    }

    function deleteAssignment(id) {
        updateData({
            assignments: data.assignments.filter(a => a.id !== id)
        });
        showToast("Assignment removed");
    }

    function deleteNote(id) {
        updateData({
            notes: data.notes.filter(n => n.id !== id)
        });
        showToast("Note deleted");
    }

    function togglePin(id) {
        updateData({
            notes: data.notes.map(n =>
                n.id === id ? { ...n, pinned: !n.pinned } : n
            )
        });
    }

    function exportData() {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "eduboard-data.json";
        a.click();
        URL.revokeObjectURL(url);
        showToast("Data exported");
    }

    function resetData() {
        if (!confirm("Reset EduBoard to demo data?")) return;
        setData(initialData);
        showToast("Demo data restored");
    }

    const completed = data.assignments.filter(a => a.completed).length;
    const total = data.assignments.length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const avgProgress = Math.round(
        data.subjects.reduce((sum, s) => sum + s.progress, 0) / Math.max(data.subjects.length, 1)
    );
    const weeklyMinutes = data.sessions.reduce((sum, s) => sum + s.minutes, 0);
    const productivityScore = Math.min(
        100,
        Math.round(avgProgress * 0.45 + completionRate * 0.35 + Math.min(100, weeklyMinutes / 8) * 0.2)
    );

    const nav = [
        ["Dashboard", "layout-dashboard"],
        ["Subjects", "book-open"],
        ["Assignments", "clipboard-check"],
        ["Notes", "notebook-pen"],
        ["Analytics", "chart-no-axes-combined"],
        ["Pomodoro", "timer"],
        ["Achievements", "trophy"],
        ["Settings", "settings"]
    ];

    return (
        <div className="min-h-screen">
            <aside className={`mobile-sidebar fixed md:fixed z-50 inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col ${sidebar ? "open" : ""}`}>
                <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setPage("Dashboard")}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Icon name="graduation-cap" size={21} />
                        </div>
                        <div className="text-left">
                            <div className="font-extrabold text-lg tracking-tight">Edu<span className="text-blue-600">Board</span></div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">PRO</div>
                        </div>
                    </button>
                    <button
                        className="md:hidden text-slate-500"
                        onClick={() => setSidebar(false)}
                    >
                        <Icon name="x" />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Workspace
                    </div>

                    <div className="space-y-1">
                        {nav.map(([name, icon]) => (
                            <button
                                key={name}
                                onClick={() => {
                                    setPage(name);
                                    setSidebar(false);
                                }}
                                className={`sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${page === name
                                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <Icon name={icon} size={18} />
                                <span>{name}</span>
                                {name === "Assignments" && (
                                    <span className="ml-auto bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                                        {data.assignments.filter(a => !a.completed).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                            <Icon name="zap" size={18} />
                        </div>
                        <div className="font-bold">Daily Focus</div>
                        <div className="text-xs text-blue-100 mt-1 mb-3">
                            Keep your study streak alive.
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full"
                                style={{ width: `${Math.min(100, weeklyMinutes / 12)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-blue-100">
                            <span>{Math.round(weeklyMinutes / 60)}h studied</span>
                            <span>{data.profile.goal / 60}h goal</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white flex items-center justify-center font-bold">
                            {data.profile.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{data.profile.name}</div>
                            <div className="text-xs text-slate-400 truncate">{data.profile.role}</div>
                        </div>
                        <button
                            onClick={() => setPage("Settings")}
                            className="ml-auto text-slate-400 hover:text-blue-600"
                        >
                            <Icon name="ellipsis" size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            <div className="md:pl-72">
                <header className="sticky top-0 z-40 h-20 glass border-b border-slate-200/70 dark:border-slate-800/70">
                    <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-4">
                        <button
                            onClick={() => setSidebar(true)}
                            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                        >
                            <Icon name="menu" />
                        </button>

                        <div className="hidden sm:block">
                            <div className="text-xs text-slate-400 font-medium">Workspace</div>
                            <div className="font-bold">{page}</div>
                        </div>

                        <div className="relative flex-1 max-w-xl ml-auto">
                            <Icon name="search" size={17} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search assignments, notes, subjects..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition"
                            />
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 shrink-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500"
                        >
                            <Icon name={data.settings.dark ? "sun" : "moon"} size={18} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500"
                            >
                                <Icon name="bell" size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full pulse-dot"></span>
                            </button>

                            {notificationsOpen && (
                                <div className="absolute right-0 top-12 w-80 card p-4 z-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold">Notifications</h3>
                                        <span className="text-xs text-blue-600">3 new</span>
                                    </div>

                                    <div className="space-y-3">
                                        <Notification icon="clock-3" title="Assignment deadline" text="JavaScript DOM Project is due soon." />
                                        <Notification icon="trophy" title="Achievement unlocked" text="You completed your first study streak." />
                                        <Notification icon="zap" title="Keep going!" text="You're close to your weekly goal." />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    {page === "Dashboard" && (
                        <Dashboard
                            data={data}
                            avgProgress={avgProgress}
                            completionRate={completionRate}
                            weeklyMinutes={weeklyMinutes}
                            productivityScore={productivityScore}
                            setModal={setModal}
                            toggleAssignment={toggleAssignment}
                            deleteAssignment={deleteAssignment}
                            setPage={setPage}
                            search={search}
                        />
                    )}

                    {page === "Subjects" && (
                        <Subjects
                            data={data}
                            setModal={setModal}
                            search={search}
                            updateData={updateData}
                            showToast={showToast}
                        />
                    )}

                    {page === "Assignments" && (
                        <Assignments
                            data={data}
                            setModal={setModal}
                            search={search}
                            toggleAssignment={toggleAssignment}
                            deleteAssignment={deleteAssignment}
                        />
                    )}

                    {page === "Notes" && (
                        <Notes
                            data={data}
                            setModal={setModal}
                            search={search}
                            deleteNote={deleteNote}
                            togglePin={togglePin}
                        />
                    )}

                    {page === "Analytics" && (
                        <Analytics
                            data={data}
                            avgProgress={avgProgress}
                            completionRate={completionRate}
                            weeklyMinutes={weeklyMinutes}
                            productivityScore={productivityScore}
                        />
                    )}

                    {page === "Pomodoro" && (
                        <Pomodoro
                            pomodoro={pomodoro}
                            setPomodoro={setPomodoro}
                            running={timerRunning}
                            setRunning={setTimerRunning}
                            mode={timerMode}
                            setMode={setTimerMode}
                            showToast={showToast}
                        />
                    )}

                    {page === "Achievements" && (
                        <Achievements
                            data={data}
                            completed={completed}
                            weeklyMinutes={weeklyMinutes}
                            avgProgress={avgProgress}
                        />
                    )}

                    {page === "Settings" && (
                        <Settings
                            data={data}
                            updateData={updateData}
                            toggleTheme={toggleTheme}
                            exportData={exportData}
                            resetData={resetData}
                            showToast={showToast}
                        />
                    )}
                </main>
            </div>

            {sidebar && (
                <div
                    className="fixed inset-0 bg-slate-950/50 z-40 md:hidden"
                    onClick={() => setSidebar(false)}
                />
            )}

            {modal === "assignment" && (
                <AssignmentModal
                    subjects={data.subjects}
                    onClose={() => setModal(null)}
                    onSave={addAssignment}
                />
            )}

            {modal === "subject" && (
                <SubjectModal
                    onClose={() => setModal(null)}
                    onSave={addSubject}
                />
            )}

            {modal === "note" && (
                <NoteModal
                    onClose={() => setModal(null)}
                    onSave={addNote}
                />
            )}

            {toast && (
                <div className="toast fixed bottom-5 right-5 z-[100] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
                    <Icon name="check-circle-2" size={18} />
                    <span className="font-semibold text-sm">{toast}</span>
                </div>
            )}
        </div>
    );
}

function Notification({ icon, title, text }) {
    return (
        <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Icon name={icon} size={16} />
            </div>
            <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-slate-400 mt-1">{text}</div>
            </div>
        </div>
    );
}

function PageTitle({ eyebrow, title, description, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
                {eyebrow && (
                    <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                        {eyebrow}
                    </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}

function StatCard({ icon, label, value, change, positive = true }) {
    return (
        <div className="card p-5">
            <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Icon name={icon} size={20} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${positive
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"
                        : "bg-rose-50 dark:bg-rose-500/10 text-rose-600"
                    }`}>
                    {change}
                </span>
            </div>
            <div className="mt-5 text-2xl font-extrabold">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
        </div>
    );
}

function Dashboard({
    data,
    avgProgress,
    completionRate,
    weeklyMinutes,
    productivityScore,
    setModal,
    toggleAssignment,
    deleteAssignment,
    setPage,
    search
}) {
    const filteredAssignments = data.assignments.filter(a =>
        `${a.title} ${a.subject}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <PageTitle
                eyebrow="Monday, August 31"
                title={
                    <>
                        Welcome back, <span className="gradient-text">{data.profile.name}</span>
                    </>
                }
                description="Here's what's happening with your learning today."
                action={
                    <button
                        onClick={() => setModal("assignment")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <Icon name="plus" size={17} />
                        New Assignment
                    </button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon="target" label="Overall Progress" value={`${avgProgress}%`} change="+8.4%" />
                <StatCard icon="clipboard-check" label="Tasks Completed" value={`${completionRate}%`} change="+12%" />
                <StatCard icon="clock-3" label="Study This Week" value={`${Math.floor(weeklyMinutes / 60)}h ${weeklyMinutes % 60}m`} change="+18%" />
                <StatCard icon="trending-up" label="Productivity Score" value={`${productivityScore}/100`} change="+6.2%" />
            </div>

            <div className="grid xl:grid-cols-3 gap-6 mb-6">
                <div className="xl:col-span-2 card p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-extrabold text-lg">Weekly Study Activity</h2>
                            <p className="text-xs text-slate-400 mt-1">Minutes spent studying</p>
                        </div>
                        <button
                            onClick={() => setPage("Analytics")}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                            View analytics
                        </button>
                    </div>
                    <StudyChart sessions={data.sessions} />
                </div>

                <div className="card p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-extrabold text-lg">Today's Goal</h2>
                            <p className="text-xs text-slate-400 mt-1">Keep your focus strong</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                            <Icon name="flame" size={18} />
                        </div>
                    </div>

                    <div className="flex items-center justify-center py-4">
                        <CircularProgress value={Math.min(100, Math.round((weeklyMinutes / 7 / data.profile.goal) * 100))} />
                    </div>

                    <div className="text-center">
                        <div className="font-extrabold text-xl">
                            {Math.round(weeklyMinutes / 7)} / {data.profile.goal} min
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Daily study target</div>
                    </div>

                    <button
                        onClick={() => setPage("Pomodoro")}
                        className="mt-5 w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-sm font-bold transition"
                    >
                        Start Focus Session
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-extrabold text-lg">Upcoming Assignments</h2>
                            <p className="text-xs text-slate-400 mt-1">Stay ahead of your deadlines</p>
                        </div>
                        <button
                            onClick={() => setPage("Assignments")}
                            className="text-xs font-bold text-blue-600"
                        >
                            View all
                        </button>
                    </div>

                    <div className="space-y-2">
                        {filteredAssignments.slice(0, 5).map(a => (
                            <AssignmentRow
                                key={a.id}
                                assignment={a}
                                toggle={() => toggleAssignment(a.id)}
                                remove={() => deleteAssignment(a.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="card p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-extrabold text-lg">Subject Progress</h2>
                            <p className="text-xs text-slate-400 mt-1">Your current performance</p>
                        </div>
                        <button
                            onClick={() => setPage("Subjects")}
                            className="text-xs font-bold text-blue-600"
                        >
                            Manage
                        </button>
                    </div>

                    <div className="space-y-5">
                        {data.subjects.slice(0, 4).map(subject => (
                            <div key={subject.id}>
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="font-semibold">{subject.name}</span>
                                    <span className="text-slate-400">{subject.progress}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="progress-bar h-full bg-blue-600 rounded-full"
                                        style={{ width: `${subject.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

function CircularProgress({ value }) {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    className="text-slate-100 dark:text-slate-800"
                />
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="text-blue-600"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-extrabold text-2xl">{value}%</span>
            </div>
        </div>
    );
}

function AssignmentRow({ assignment, toggle, remove }) {
    const priorityClass = {
        High: "bg-rose-50 dark:bg-rose-500/10 text-rose-600",
        Medium: "bg-amber-50 dark:bg-amber-500/10 text-amber-600",
        Low: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"
    };

    return (
        <div className={`group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition ${assignment.completed ? "opacity-60" : ""}`}>
            <button
                onClick={toggle}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${assignment.completed
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
            >
                {assignment.completed && <Icon name="check" size={12} />}
            </button>

            <div className="min-w-0 flex-1">
                <div className={`font-semibold text-sm truncate ${assignment.completed ? "line-through" : ""}`}>
                    {assignment.title}
                </div>
                <div className="text-xs text-slate-400 mt-1">{assignment.subject} · Due {assignment.due}</div>
            </div>

            <span className={`hidden sm:block text-[10px] font-bold px-2 py-1 rounded-full ${priorityClass[assignment.priority]}`}>
                {assignment.priority}
            </span>

            <button
                onClick={remove}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition"
            >
                <Icon name="trash-2" size={16} />
            </button>
        </div>
    );
}

function StudyChart({ sessions }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        const chart = new Chart(ref.current, {
            type: "line",
            data: {
                labels: sessions.map(s => s.day),
                datasets: [{
                    data: sessions.map(s => s.minutes),
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37,99,235,.08)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: "#2563eb"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: "rgba(148,163,184,.12)" },
                        ticks: { color: "#94a3b8" }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: "#94a3b8" }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [sessions]);

    return (
        <div className="h-[280px]">
            <canvas ref={ref}></canvas>
        </div>
    );
}

function Subjects({ data, setModal, search, updateData, showToast }) {
    const subjects = data.subjects.filter(s =>
        `${s.name} ${s.teacher}`.toLowerCase().includes(search.toLowerCase())
    );

    function increase(id) {
        updateData({
            subjects: data.subjects.map(s =>
                s.id === id ? { ...s, progress: Math.min(100, s.progress + 5) } : s
            )
        });
        showToast("Subject progress updated");
    }

    return (
        <>
            <PageTitle
                eyebrow="Learning"
                title="Your Subjects"
                description="Track your progress across every subject."
                action={
                    <button
                        onClick={() => setModal("subject")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
                    >
                        <Icon name="plus" size={17} />
                        Add Subject
                    </button>
                }
            />

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {subjects.map(subject => (
                    <div className="card p-5" key={subject.id}>
                        <div className="flex justify-between">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <Icon name="book-open" size={20} />
                            </div>
                            <button className="text-slate-400">
                                <Icon name="more-horizontal" size={18} />
                            </button>
                        </div>

                        <h3 className="font-extrabold mt-5">{subject.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{subject.teacher}</p>

                        <div className="mt-6">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-400">Progress</span>
                                <strong>{subject.progress}%</strong>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <div
                                    className="h-full bg-blue-600 rounded-full progress-bar"
                                    style={{ width: `${subject.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-5">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                <div className="font-bold">{subject.hours}h</div>
                                <div className="text-[10px] text-slate-400">Study time</div>
                            </div>
                            <button
                                onClick={() => increase(subject.id)}
                                className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl p-3 font-bold text-xs"
                            >
                                +5% progress
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

function Assignments({
    data,
    setModal,
    search,
    toggleAssignment,
    deleteAssignment
}) {
    const [filter, setFilter] = useState("All");

    const assignments = data.assignments.filter(a => {
        const matchesSearch = `${a.title} ${a.subject}`.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filter === "All" ||
            (filter === "Completed" && a.completed) ||
            (filter === "Pending" && !a.completed) ||
            a.priority === filter;

        return matchesSearch && matchesFilter;
    });

    return (
        <>
            <PageTitle
                eyebrow="Tasks"
                title="Assignments"
                description="Manage deadlines, priorities and completed work."
                action={
                    <button
                        onClick={() => setModal("assignment")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
                    >
                        <Icon name="plus" size={17} />
                        New Assignment
                    </button>
                }
            />

            <div className="card p-3 mb-5 flex gap-2 overflow-x-auto">
                {["All", "Pending", "Completed", "High", "Medium", "Low"].map(item => (
                    <button
                        key={item}
                        onClick={() => setFilter(item)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${filter === item
                                ? "bg-blue-600 text-white"
                                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <div className="card overflow-hidden">
                <div className="hidden md:grid grid-cols-[1fr_150px_130px_110px_50px] gap-4 px-5 py-4 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Assignment</span>
                    <span>Subject</span>
                    <span>Due Date</span>
                    <span>Priority</span>
                    <span></span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {assignments.map(a => (
                        <div key={a.id} className="p-4 sm:px-5 flex flex-col md:grid md:grid-cols-[1fr_150px_130px_110px_50px] gap-3 md:gap-4 md:items-center">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleAssignment(a.id)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${a.completed ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                                        }`}
                                >
                                    {a.completed && <Icon name="check" size={12} />}
                                </button>
                                <span className={`font-semibold text-sm ${a.completed ? "line-through text-slate-400" : ""}`}>
                                    {a.title}
                                </span>
                            </div>

                            <div className="text-xs text-slate-400">{a.subject}</div>
                            <div className="text-xs text-slate-400">{a.due}</div>

                            <div>
                                <span className={`inline-flex text-[10px] font-bold px-2 py-1 rounded-full ${a.priority === "High"
                                        ? "bg-rose-50 text-rose-600"
                                        : a.priority === "Medium"
                                            ? "bg-amber-50 text-amber-600"
                                            : "bg-emerald-50 text-emerald-600"
                                    }`}>
                                    {a.priority}
                                </span>
                            </div>

                            <button
                                onClick={() => deleteAssignment(a.id)}
                                className="text-slate-400 hover:text-rose-500"
                            >
                                <Icon name="trash-2" size={16} />
                            </button>
                        </div>
                    ))}

                    {!assignments.length && (
                        <div className="py-16 text-center text-slate-400">
                            <Icon name="clipboard-x" size={32} />
                            <div className="font-semibold mt-3">No assignments found</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function Notes({ data, setModal, search, deleteNote, togglePin }) {
    const notes = data.notes.filter(n =>
        `${n.title} ${n.content}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <PageTitle
                eyebrow="Knowledge"
                title="Notes"
                description="Keep your important learning notes organized."
                action={
                    <button
                        onClick={() => setModal("note")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
                    >
                        <Icon name="plus" size={17} />
                        New Note
                    </button>
                }
            />

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {notes.map(note => (
                    <div key={note.id} className="card p-5 relative group">
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <Icon name="notebook-pen" size={18} />
                            </div>

                            <div className="flex gap-1">
                                <button
                                    onClick={() => togglePin(note.id)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${note.pinned ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10" : "text-slate-400"
                                        }`}
                                >
                                    <Icon name="pin" size={15} />
                                </button>
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500"
                                >
                                    <Icon name="trash-2" size={15} />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-extrabold mt-5">{note.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-6">
                            {note.content}
                        </p>

                        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                            <Icon name="calendar-days" size={13} />
                            {note.date}
                            {note.pinned && (
                                <span className="ml-auto text-blue-600 font-bold">Pinned</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

function Analytics({ data, avgProgress, completionRate, weeklyMinutes, productivityScore }) {
    return (
        <>
            <PageTitle
                eyebrow="Insights"
                title="Learning Analytics"
                description="Understand your study habits and academic progress."
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon="target" label="Average Subject Progress" value={`${avgProgress}%`} change="+8%" />
                <StatCard icon="check-check" label="Completion Rate" value={`${completionRate}%`} change="+12%" />
                <StatCard icon="clock-3" label="Weekly Study" value={`${Math.round(weeklyMinutes / 60)}h`} change="+18%" />
                <StatCard icon="brain" label="Productivity" value={`${productivityScore}%`} change="+6%" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="card p-5 sm:p-6">
                    <h2 className="font-extrabold text-lg">Study Activity</h2>
                    <p className="text-xs text-slate-400 mt-1 mb-5">Your weekly focus pattern</p>
                    <StudyChart sessions={data.sessions} />
                </div>

                <div className="card p-5 sm:p-6">
                    <h2 className="font-extrabold text-lg">Subject Performance</h2>
                    <p className="text-xs text-slate-400 mt-1 mb-5">Current progress by subject</p>
                    <SubjectChart subjects={data.subjects} />
                </div>
            </div>

            <div className="card p-6 mt-6">
                <h2 className="font-extrabold text-lg">Learning Insights</h2>
                <div className="grid md:grid-cols-3 gap-4 mt-5">
                    <Insight icon="trending-up" title="Strong Progress" text={`Your average subject progress is ${avgProgress}%. Keep maintaining your consistency.`} />
                    <Insight icon="clock" title="Study Habit" text={`You've studied ${Math.round(weeklyMinutes / 60)} hours this week.`} />
                    <Insight icon="check-circle-2" title="Task Discipline" text={`${completionRate}% of your assignments are completed.`} />
                </div>
            </div>
        </>
    );
}

function Insight({ icon, title, text }) {
    return (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Icon name={icon} size={18} />
            </div>
            <h3 className="font-bold mt-4">{title}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-5">{text}</p>
        </div>
    );
}

function SubjectChart({ subjects }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        const chart = new Chart(ref.current, {
            type: "bar",
            data: {
                labels: subjects.map(s => s.name),
                datasets: [{
                    data: subjects.map(s => s.progress),
                    backgroundColor: "#2563eb",
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: "rgba(148,163,184,.12)" },
                        ticks: { color: "#94a3b8" }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: "#94a3b8" }
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [subjects]);

    return (
        <div className="h-[280px]">
            <canvas ref={ref}></canvas>
        </div>
    );
}

function Pomodoro({
    pomodoro,
    setPomodoro,
    running,
    setRunning,
    mode,
    setMode,
    showToast
}) {
    const minutes = String(Math.floor(pomodoro / 60)).padStart(2, "0");
    const seconds = String(pomodoro % 60).padStart(2, "0");

    function selectMode(next) {
        setMode(next);
        setRunning(false);
        setPomodoro(next === "Focus" ? 25 * 60 : next === "Short Break" ? 5 * 60 : 15 * 60);
    }

    function reset() {
        setRunning(false);
        setPomodoro(mode === "Focus" ? 25 * 60 : mode === "Short Break" ? 5 * 60 : 15 * 60);
    }

    return (
        <>
            <PageTitle
                eyebrow="Focus Mode"
                title="Pomodoro Timer"
                description="Work in focused sessions and take intentional breaks."
            />

            <div className="max-w-4xl mx-auto">
                <div className="card p-6 sm:p-10 text-center">
                    <div className="flex justify-center gap-2 mb-10">
                        {["Focus", "Short Break", "Long Break"].map(item => (
                            <button
                                key={item}
                                onClick={() => selectMode(item)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold ${mode === item
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="text-[80px] sm:text-[120px] leading-none font-extrabold tracking-tight tabular-nums gradient-text">
                        {minutes}:{seconds}
                    </div>

                    <div className="text-sm text-slate-400 mt-5">
                        {running ? "Stay focused. You've got this." : "Ready when you are."}
                    </div>

                    <div className="flex justify-center gap-3 mt-8">
                        <button
                            onClick={() => setRunning(!running)}
                            className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2"
                        >
                            <Icon name={running ? "pause" : "play"} size={18} />
                            {running ? "Pause" : "Start Focus"}
                        </button>

                        <button
                            onClick={reset}
                            className="px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                        >
                            <Icon name="rotate-ccw" size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-5">
                    <Insight icon="timer" title="25 Minutes" text="Default focus session designed for deep work." />
                    <Insight icon="coffee" title="5 Minutes" text="Take a short break and reset your attention." />
                    <Insight icon="trophy" title="Consistency" text="Complete multiple sessions to build your streak." />
                </div>
            </div>
        </>
    );
}

function Achievements({ data, completed, weeklyMinutes, avgProgress }) {
    const achievements = [
        {
            title: "First Step",
            description: "Complete your first assignment",
            icon: "flag",
            unlocked: completed >= 1
        },
        {
            title: "Task Crusher",
            description: "Complete 3 assignments",
            icon: "check-check",
            unlocked: completed >= 3
        },
        {
            title: "Study Machine",
            description: "Study for 5+ hours this week",
            icon: "zap",
            unlocked: weeklyMinutes >= 300
        },
        {
            title: "Academic Star",
            description: "Reach 80% average progress",
            icon: "star",
            unlocked: avgProgress >= 80
        },
        {
            title: "Knowledge Keeper",
            description: "Create 3 notes",
            icon: "notebook-pen",
            unlocked: data.notes.length >= 3
        },
        {
            title: "Subject Master",
            description: "Reach 90% in a subject",
            icon: "graduation-cap",
            unlocked: data.subjects.some(s => s.progress >= 90)
        }
    ];

    return (
        <>
            <PageTitle
                eyebrow="Milestones"
                title="Achievements"
                description="Turn consistency into progress and unlock new milestones."
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {achievements.map(a => (
                    <div
                        key={a.title}
                        className={`card p-6 ${a.unlocked ? "" : "opacity-55"}`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${a.unlocked
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}>
                            <Icon name={a.icon} size={24} />
                        </div>

                        <div className="flex items-center gap-2 mt-5">
                            <h3 className="font-extrabold">{a.title}</h3>
                            {a.unlocked && <Icon name="badge-check" size={16} />}
                        </div>

                        <p className="text-xs text-slate-400 mt-2">{a.description}</p>

                        <div className={`mt-5 text-[10px] font-bold uppercase tracking-wider ${a.unlocked ? "text-blue-600" : "text-slate-400"
                            }`}>
                            {a.unlocked ? "Unlocked" : "Locked"}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

function Settings({
    data,
    updateData,
    toggleTheme,
    exportData,
    resetData,
    showToast
}) {
    const [name, setName] = useState(data.profile.name);

    function saveProfile() {
        updateData({
            profile: {
                ...data.profile,
                name: name || "Student"
            }
        });
        showToast("Profile updated");
    }

    return (
        <>
            <PageTitle
                eyebrow="Preferences"
                title="Settings"
                description="Customize your EduBoard experience."
            />

            <div className="max-w-3xl space-y-5">
                <div className="card p-6">
                    <h2 className="font-extrabold text-lg">Profile</h2>
                    <p className="text-xs text-slate-400 mt-1">Update your student profile.</p>

                    <div className="mt-5 grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500">Display Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500">Role</label>
                            <input
                                value={data.profile.role}
                                readOnly
                                className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm opacity-70"
                            />
                        </div>
                    </div>

                    <button
                        onClick={saveProfile}
                        className="mt-5 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm"
                    >
                        Save Profile
                    </button>
                </div>

                <div className="card p-6">
                    <h2 className="font-extrabold text-lg">Appearance</h2>

                    <div className="flex items-center justify-between mt-5">
                        <div>
                            <div className="font-semibold text-sm">Dark Mode</div>
                            <div className="text-xs text-slate-400 mt-1">Switch between light and dark themes.</div>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className={`w-12 h-7 rounded-full p-1 transition ${data.settings.dark ? "bg-blue-600" : "bg-slate-300"
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition ${data.settings.dark ? "translate-x-5" : ""
                                }`} />
                        </button>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="font-extrabold text-lg">Notifications</h2>

                    <div className="flex items-center justify-between mt-5">
                        <div>
                            <div className="font-semibold text-sm">Study reminders</div>
                            <div className="text-xs text-slate-400 mt-1">Receive productivity reminders.</div>
                        </div>

                        <button
                            onClick={() =>
                                updateData({
                                    settings: {
                                        ...data.settings,
                                        notifications: !data.settings.notifications
                                    }
                                })
                            }
                            className={`w-12 h-7 rounded-full p-1 transition ${data.settings.notifications ? "bg-blue-600" : "bg-slate-300"
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition ${data.settings.notifications ? "translate-x-5" : ""
                                }`} />
                        </button>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="font-extrabold text-lg">Your Data</h2>
                    <p className="text-xs text-slate-400 mt-1">Your data is stored locally in your browser.</p>

                    <div className="flex flex-wrap gap-3 mt-5">
                        <button
                            onClick={exportData}
                            className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm flex items-center gap-2"
                        >
                            <Icon name="download" size={16} />
                            Export Data
                        </button>

                        <button
                            onClick={resetData}
                            className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 font-bold text-sm flex items-center gap-2"
                        >
                            <Icon name="refresh-ccw" size={16} />
                            Reset Demo
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function Modal({ children, title, subtitle, onClose }) {
    return (
        <div className="modal-backdrop fixed inset-0 z-[90] bg-slate-950/60 flex items-center justify-center p-4">
            <div className="modal-box w-full max-w-lg card p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-extrabold">{title}</h2>
                        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                    >
                        <Icon name="x" size={17} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function AssignmentModal({ subjects, onClose, onSave }) {
    const [form, setForm] = useState({
        title: "",
        subject: subjects[0]?.name || "",
        due: "2026-09-05",
        priority: "Medium"
    });

    function submit(e) {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSave(form);
    }

    return (
        <Modal title="New Assignment" subtitle="Add a task to your study plan." onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Assignment Title">
                    <input
                        required
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. JavaScript Project"
                        className="input"
                    />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Subject">
                        <select
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                            className="input"
                        >
                            {subjects.map(s => <option key={s.id}>{s.name}</option>)}
                        </select>
                    </Field>

                    <Field label="Due Date">
                        <input
                            type="date"
                            value={form.due}
                            onChange={e => setForm({ ...form, due: e.target.value })}
                            className="input"
                        />
                    </Field>
                </div>

                <Field label="Priority">
                    <div className="grid grid-cols-3 gap-2">
                        {["Low", "Medium", "High"].map(p => (
                            <button
                                type="button"
                                key={p}
                                onClick={() => setForm({ ...form, priority: p })}
                                className={`py-3 rounded-xl text-xs font-bold border ${form.priority === p
                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-500/10 text-blue-600"
                                        : "border-slate-200 dark:border-slate-700"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </Field>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold">
                    Create Assignment
                </button>
            </form>
        </Modal>
    );
}

function SubjectModal({ onClose, onSave }) {
    const [form, setForm] = useState({
        name: "",
        teacher: "",
        progress: 50
    });

    function submit(e) {
        e.preventDefault();
        if (!form.name.trim()) return;
        onSave(form);
    }

    return (
        <Modal title="Add Subject" subtitle="Create a new subject tracker." onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Subject Name">
                    <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Physics"
                        className="input"
                    />
                </Field>

                <Field label="Teacher">
                    <input
                        value={form.teacher}
                        onChange={e => setForm({ ...form, teacher: e.target.value })}
                        placeholder="e.g. Mr. Khan"
                        className="input"
                    />
                </Field>

                <Field label={`Current Progress — ${form.progress}%`}>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={form.progress}
                        onChange={e => setForm({ ...form, progress: e.target.value })}
                        className="w-full accent-blue-600"
                    />
                </Field>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold">
                    Add Subject
                </button>
            </form>
        </Modal>
    );
}

function NoteModal({ onClose, onSave }) {
    const [form, setForm] = useState({
        title: "",
        content: ""
    });

    function submit(e) {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;
        onSave(form);
    }

    return (
        <Modal title="Create Note" subtitle="Capture something worth remembering." onClose={onClose}>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Title">
                    <input
                        required
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. React Hooks"
                        className="input"
                    />
                </Field>

                <Field label="Content">
                    <textarea
                        required
                        rows="6"
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        placeholder="Write your note..."
                        className="input resize-none"
                    />
                </Field>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold">
                    Save Note
                </button>
            </form>
        </Modal>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</label>
            <div className="mt-2">{children}</div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);