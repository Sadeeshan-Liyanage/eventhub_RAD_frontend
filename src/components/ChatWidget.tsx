import { FormEvent, Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { getErrorMessage } from "../utils/errors";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Msg = {
  role: "assistant",
  content: "Hi! I'm the EventHub assistant. Ask me about events, ticket prices, seats left, or whether a date is free.",
};

const SUGGESTIONS = ["What events are coming up?", "Cheapest tickets?", "Are there any events on 30 Nov?"];



const renderText = (text: string, onNavigate: () => void): ReactNode =>
  text.split(/(\/events\/[a-f0-9]{24}|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (/^\/events\/[a-f0-9]{24}$/.test(part)) {
      return (
        <Link key={i} to={part} onClick={onNavigate} className="font-semibold underline">
          View event
        </Link>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return <Fragment key={i}>{part}</Fragment>;
  });

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    try {


      const history = next.slice(1).slice(-10);
      const { data } = await api.post("/chat", { messages: history });
      setMessages([...next, { role: "assistant", content: data.data.reply }]);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="no-print">
      {open && (
        <section
          role="dialog"
          aria-label="EventHub assistant"
          className="fixed inset-x-3 bottom-24 z-40 flex h-[32rem] max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:w-96"
        >
          <header className="flex items-center justify-between bg-ink px-4 py-3 text-white">
            <div>
              <h2 className="font-semibold">EventHub assistant</h2>
              <p className="text-xs text-white/70">AI answers from live event data</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-md p-1.5 hover:bg-white/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "rounded-br-sm bg-ink text-white" : "rounded-bl-sm bg-white text-ink ring-1 ring-line"
                  }`}
                >
                  {m.role === "assistant" ? renderText(m.content, () => setOpen(false)) : m.content}
                </p>
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-line hover:ring-ink">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start" role="status" aria-label="Assistant is typing">
                <span className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 ring-1 ring-line">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/50" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/50 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/50 [animation-delay:300ms]" />
                </span>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={submit} className="flex gap-2 border-t border-line bg-white p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Ask about events…"
              aria-label="Your message"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-ink focus:outline-none"
            />
            <button
              disabled={loading || !input.trim()}
              className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-saffron text-ink shadow-lg transition-transform hover:scale-105"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
      </button>
    </div>
  );
}



