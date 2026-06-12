import { useState } from "react";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {   
    setLoading(true);
    setError("");
    try {
      const url = isRegister ? "http://localhost:8000/auth/register" : "http://localhost:8000/auth/login";
      const body = isRegister
        ? { username: form.username, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "An error occurred");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      onLogin(data.token, data.username);
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='h-screen w-full flex items-center justify-center bg-[#F5F5F7] px-4 select-none'>
      <div className='bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl p-6 md:p-8 w-full max-w-sm flex flex-col gap-5 shadow-xl shadow-gray-200/50'>
        
        <div className="text-center space-y-1">
          <h1 className='text-xl font-bold tracking-tight text-gray-900'>Engine Analytics</h1>
          <p className='text-xs text-gray-400 font-medium'>
            {isRegister ? "Create workspace ID to begin" : "Authenticate to access index records"}
          </p>
        </div>

        <div className="space-y-2.5">
          {isRegister && (
            <div className="relative flex items-center">
              <svg className="absolute left-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                placeholder='Username'
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className='w-full border border-gray-200 bg-gray-50/50 text-sm p-2 pl-9 rounded-xl focus:outline-none focus:border-gray-400 focus:bg-white transition-all'
              />
            </div>
          )}
          <div className="relative flex items-center">
            <svg className="absolute left-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input
              placeholder='Email Address'
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className='w-full border border-gray-200 bg-gray-50/50 text-sm p-2 pl-9 rounded-xl focus:outline-none focus:border-gray-400 focus:bg-white transition-all'
            />
          </div>
          <div className="relative flex items-center">
            <svg className="absolute left-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              placeholder='Password'
              type='password'
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className='w-full border border-gray-200 bg-gray-50/50 text-sm p-2 pl-9 rounded-xl focus:outline-none focus:border-gray-400 focus:bg-white transition-all'
            />
          </div>
        </div>

        {error && <p className='text-xs font-medium text-red-500 text-center bg-red-50/60 py-1.5 rounded-lg border border-red-100'>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className='w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm'
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          ) : isRegister ? "Create Account" : "Access Workspace"}
        </button>

        <p
          onClick={() => setIsRegister(!isRegister)}
          className='text-center text-xs text-gray-400 font-medium cursor-pointer hover:text-gray-900 transition-colors'
        >
          {isRegister ? "Already configured? Sign In" : "Need registration? Configure Access"}
        </p>
      </div>
    </div>
  )
}

export default Login