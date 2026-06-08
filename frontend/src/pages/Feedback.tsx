import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { useApiResource } from '../hooks/useApiResource';
import { useAuth } from '../hooks/useAuth';
import { feedbackService } from '../services/feedback-service';
import { formatDateTime, humanize } from '../utils/formatters';
import { FeedbackThread } from '../types';

function senderName(sender?: FeedbackThread['creator']) {
  if (!sender) return 'Unknown';
  return `${sender.firstName} ${sender.lastName}`;
}

function ComposeModal({
  isOpen,
  onClose,
  onSent,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSent: (threadId: string) => void;
}) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setSending(true);
    try {
      const res = await feedbackService.create({ subject: subject.trim(), body: body.trim() });
      toast.success('Feedback sent to RHU');
      setSubject('');
      setBody('');
      onSent(res.data.thread.id);
      onClose();
    } catch {
      toast.error('Failed to send feedback');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compose-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 id="compose-title" className="mb-1 text-lg font-semibold text-slate-900">
          New feedback to RHU
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Send a message to the Rural Health Unit about concerns, requests, or updates from your
          barangay.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Request for fogging schedule"
            maxLength={200}
            required
          />
          <Textarea
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe your feedback..."
            rows={6}
            maxLength={5000}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? 'Sending...' : 'Send to RHU'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ThreadDetail({
  threadId,
  onThreadUpdated,
  onBack,
}: {
  threadId: string;
  onThreadUpdated: () => void;
  onBack?: () => void;
}) {
  const { user } = useAuth();
  const [thread, setThread] = useState<FeedbackThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);

  const loadThread = useCallback(async () => {
    setLoading(true);
    try {
      const res = await feedbackService.getById(threadId);
      setThread(res.data.thread);
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      const res = await feedbackService.reply(threadId, replyBody.trim());
      setThread(res.data.thread);
      setReplyBody('');
      toast.success('Reply sent');
      onThreadUpdated();
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async () => {
    if (!thread) return;
    try {
      const res =
        thread.status === 'OPEN'
          ? await feedbackService.close(threadId)
          : await feedbackService.reopen(threadId);
      setThread(res.data.thread);
      toast.success(thread.status === 'OPEN' ? 'Thread closed' : 'Thread reopened');
      onThreadUpdated();
    } catch {
      toast.error('Failed to update thread status');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center">
        <Spinner label="Loading conversation..." />
      </div>
    );
  }

  if (!thread) {
    return (
      <EmptyState
        icon="📭"
        title="Conversation not found"
        description="This thread may have been removed or you do not have access."
      />
    );
  }

  const isClosed = thread.status === 'CLOSED';

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mb-2 text-sm font-medium text-primary-600 hover:text-primary-700 lg:hidden"
              >
                ← Back to inbox
              </button>
            )}
            <h2 className="truncate text-lg font-semibold text-slate-900">{thread.subject}</h2>
            <div className="mt-1 space-y-0.5 text-sm text-slate-500">
              <p>
                From: {senderName(thread.creator)}
                {thread.barangay && ` · ${thread.barangay.name}`}
              </p>
              <p>
                Status:{' '}
                <span
                  className={
                    isClosed
                      ? 'rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600'
                      : 'rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'
                  }
                >
                  {humanize(thread.status)}
                </span>
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={toggleStatus}>
            {isClosed ? 'Reopen' : 'Close'}
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
        {(thread.messages ?? []).map((msg) => {
          const isOwn = msg.senderId === user?.id;
          const isRhu = msg.sender?.role === 'ADMIN';
          return (
            <article
              key={msg.id}
              className={`rounded-xl border p-4 ${
                isOwn
                  ? 'ml-4 border-primary-100 bg-primary-50 sm:ml-12'
                  : 'mr-4 border-slate-200 bg-white sm:mr-12'
              }`}
            >
              <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown'}
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      {isRhu ? '(RHU)' : msg.sender?.role === 'BHW' ? '(Barangay)' : ''}
                    </span>
                  </p>
                  <time className="text-xs text-slate-500" dateTime={msg.createdAt}>
                    {formatDateTime(msg.createdAt)}
                  </time>
                </div>
              </header>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{msg.body}</p>
            </article>
          );
        })}
      </div>

      {!isClosed && (
        <form
          onSubmit={handleReply}
          className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6"
        >
          <Textarea
            label="Reply"
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder={
              user?.role === 'ADMIN'
                ? 'Write your response to the barangay...'
                : 'Write a follow-up message...'
            }
            rows={3}
            maxLength={5000}
          />
          <div className="mt-3 flex justify-end">
            <Button type="submit" disabled={sending || !replyBody.trim()}>
              {sending ? 'Sending...' : 'Send reply'}
            </Button>
          </div>
        </form>
      )}

      {isClosed && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500 sm:px-6">
          This thread is closed. Reopen it to send more messages.
        </div>
      )}
    </div>
  );
}

export default function Feedback() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const { data, loading, refreshing, refetch } = useApiResource(
    () => feedbackService.list({ status: statusFilter || undefined, limit: 100 }),
    [statusFilter],
    { errorMessage: 'Failed to load inbox' }
  );

  const threads = data?.data.items ?? [];
  const isBhw = user?.role === 'BHW';

  const handleSelectThread = (id: string) => {
    setSelectedId(id);
    setShowMobileDetail(true);
  };

  const handleThreadUpdated = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Inbox"
        subtitle={
          user?.role === 'ADMIN'
            ? 'Messages from barangays — respond to concerns and requests'
            : 'Send feedback to the RHU and view responses'
        }
        actions={
          isBhw ? (
            <Button onClick={() => setComposeOpen(true)}>Compose</Button>
          ) : undefined
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[560px] flex-col lg:flex-row">
          {/* Inbox list */}
          <aside
            className={`w-full border-slate-200 lg:w-96 lg:border-r ${
              showMobileDetail ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="border-b border-slate-200 p-4">
              <Select
                label="Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All messages</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </Select>
            </div>

            {loading ? (
              <div className="p-6">
                <Spinner label="Loading inbox..." />
              </div>
            ) : threads.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon="📬"
                  title="Inbox is empty"
                  description={
                    isBhw
                      ? 'Tap Compose to send your first message to the RHU.'
                      : 'No feedback from barangays yet.'
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100" aria-label="Feedback threads">
                {refreshing && (
                  <li className="px-4 py-2 text-xs font-medium text-slate-500">Refreshing...</li>
                )}
                {threads.map((thread) => {
                  const isSelected = selectedId === thread.id;
                  const hasUnread = (thread.unreadCount ?? 0) > 0;
                  return (
                    <li key={thread.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectThread(thread.id)}
                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                          isSelected ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              hasUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                            }`}
                          >
                            {thread.subject}
                          </p>
                          {hasUnread && (
                            <span
                              className="shrink-0 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-medium text-white"
                              aria-label={`${thread.unreadCount} unread`}
                            >
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {user?.role === 'ADMIN' && thread.barangay
                            ? `${thread.barangay.name} · `
                            : ''}
                          {thread.latestMessage?.body ?? 'No messages'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDateTime(thread.lastMessageAt)}
                          {thread.status === 'CLOSED' && (
                            <span className="ml-2 text-slate-500">· Closed</span>
                          )}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* Thread detail */}
          <section
            className={`min-h-[400px] flex-1 ${
              showMobileDetail ? 'block' : 'hidden lg:block'
            }`}
          >
            {selectedId ? (
              <ThreadDetail
                threadId={selectedId}
                onThreadUpdated={handleThreadUpdated}
                onBack={() => setShowMobileDetail(false)}
              />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center p-6">
                <EmptyState
                  icon="✉️"
                  title="Select a conversation"
                  description="Choose a message from the inbox to read and reply."
                />
              </div>
            )}
          </section>
        </div>
      </div>

      <ComposeModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={(threadId) => {
          refetch();
          setSelectedId(threadId);
          setShowMobileDetail(true);
        }}
      />
    </div>
  );
}
