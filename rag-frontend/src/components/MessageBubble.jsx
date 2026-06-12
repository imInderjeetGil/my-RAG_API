function ProgressUI({ steps }) {
  const stepList = [
    { key: "extract", label: "Extracting text" },
    { key: "chunk", label: "Creating chunks" },
    { key: "embed", label: "Generating embeddings" },
  ];

  return (
    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5 w-full">
      {stepList.map(({ key, label }) => {
        const step = steps[key];
        if (!step) return null;
        const isLoading = step.status === "loading";
        
        return (
          <div key={key} className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
            {isLoading ? (
              <svg className="animate-spin h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            <span className={isLoading ? "text-gray-800 font-semibold" : ""}>
              {label}
              {key === "chunk" && step.status === "done" && step.count ? ` (${step.count} blocks)` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MessageBubble({ role, content, steps }) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm transition-all duration-200
          ${isUser 
            ? "bg-gray-900 text-white rounded-br-sm" 
            : "bg-gray-100/80 text-gray-900 border border-gray-200/30 rounded-bl-sm"
          }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        
        {steps && Object.keys(steps).length > 0 && (
          <ProgressUI steps={steps} />
        )}
      </div>
    </div>
  );
}

export default MessageBubble;