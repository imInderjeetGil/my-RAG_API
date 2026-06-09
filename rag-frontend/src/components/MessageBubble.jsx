function ProgressUI({ steps }) {
  const stepList = [
    { key: "extract", label: "Extracting text" },
    { key: "chunk", label: "Creating chunks" },
    { key: "embed", label: "Embedding chunks" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {stepList.map(({ key, label }) => {
        const step = steps[key];
        if (!step) return null;
        return (
          <div key={key} className="flex items-center gap-2">
            {step.status === "loading" ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>✅</span>
            )}
            <span>
              {label}
              {key === "chunk" && step.status === "done" && step.count
                ? ` (${step.count} chunks)`
                : ""}
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
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isUser ? "bg-blue-500 text-white" : "text-black"
        }`}
      >
        <p>{content}</p>
        {steps && Object.keys(steps).length > 0 && (
          <div className="mt-2">
            <ProgressUI steps={steps} />
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;