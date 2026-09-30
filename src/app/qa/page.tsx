import { MessageCircle, Send } from "lucide-react";
import { Suspense } from "react";
import { SectionTitle } from "@/components/section-title";
import { getQuestions } from "@/lib/data";
import { submitQuestion } from "@/app/actions";

async function QaAnswers({ questionsPromise }: { questionsPromise: ReturnType<typeof getQuestions> }) {
  const questions = await questionsPromise;
  return <div className="qa-answers"><div className="section-top"><SectionTitle>Answered questions</SectionTitle><span className="quiet-label">public · {questions.length}</span></div>{questions.length ? questions.map((question) => <article className="qa-card" key={question.id}><div className="qa-question"><MessageCircle size={17} /><h3>{question.body}</h3></div><p>{question.answer}</p></article>) : <div className="empty-state"><p>No public answers yet.</p></div>}</div>;
}

export default async function QaPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const questionsPromise = getQuestions();
  const params = await searchParams;
  return <div className="page-section qa-page"><div className="page-intro"><p className="eyebrow">open channel</p><h1>Ask me anything.</h1><p>Leave a question anonymously. If it might help someone else, I may share the answer here.</p></div><form className="qa-form framed-panel" action={submitQuestion}><label htmlFor="question">your question <span>({"<"} 1000 characters)</span></label><textarea id="question" name="body" maxLength={1000} required minLength={4} placeholder="What are you curious about?" /><label className="honeypot" aria-hidden="true">Do not fill this out<input name="website" tabIndex={-1} autoComplete="off" /></label><div className="form-footer"><span>No name or email needed.</span><button className="button button-primary" type="submit">send question <Send size={15} /></button></div>{params.sent && <p className="form-message success">Thanks — your question is in the inbox.</p>}{params.error && <p className="form-message">{decodeURIComponent(params.error)}</p>}</form><Suspense fallback={<div className="qa-answers skeleton-card" aria-label="Loading answered questions"><span className="skeleton skeleton-title" /><span className="skeleton skeleton-line wide" /></div>}><QaAnswers questionsPromise={questionsPromise} /></Suspense></div>;
}