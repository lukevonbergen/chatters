import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

// Helper: try to pull a numeric rating from a row safely
const getRowRating = (row) => {
  // Prefer explicit fields if they exist, then fallback
  const cand = row.session_rating ?? row.rating ?? row.score ?? null;
  const num = typeof cand === 'number' ? cand : Number(cand);
  return Number.isFinite(num) ? num : null;
};

// Group raw rows -> one row per session_id
const groupBySession = (rows) => {
  const map = new Map();

  for (const r of rows) {
    const sid = r.session_id ?? r.sessionId;
    if (!sid) continue;

    const entry = map.get(sid) || {
      session_id: sid,
      table_number: r.table_number ?? r.tableNumber ?? '—',
      created_at: r.created_at,
      items_count: 0,
      ratings: [],
      has_comment: false,
      comments: [],
      last_question: null, // optional: show one question line
    };

    // count
    entry.items_count += 1;

    // latest timestamp
    if (!entry.created_at || new Date(r.created_at) > new Date(entry.created_at)) {
      entry.created_at = r.created_at;
    }

    // rating
    const rating = getRowRating(r);
    if (rating !== null) entry.ratings.push(rating);

    // comment presence
    const comment = r.additional_feedback?.trim();
    if (comment) {
      entry.has_comment = true;
      // keep a short list of unique comments (optional)
      if (!entry.comments.includes(comment)) entry.comments.push(comment);
    }

    // keep one question text if available (optional display)
    const q = r.questions?.question ?? r.question;
    if (q && !entry.last_question) entry.last_question = q;

    map.set(sid, entry);
  }

  // Finalise aggregates
  return Array.from(map.values()).map((e) => {
    const avg =
      e.ratings.length > 0
        ? e.ratings.reduce((a, b) => a + b, 0) / e.ratings.length
        : null;

    return {
      session_id: e.session_id,
      table_number: e.table_number,
      created_at: e.created_at,
      items_count: e.items_count,
      session_rating: avg, // overall score per session
      has_comment: e.has_comment,
      // keep a single preview comment (optional)
      additional_feedback: e.comments[0] ?? '',
      // keep one question to show (optional)
      question_preview: e.last_question ?? null,
    };
  });
};

const getRatingColour = (rating) => {
  if (rating == null) return 'text-gray-600 bg-gray-50 border-gray-200';
  if (rating <= 2) return 'text-red-600 bg-red-50 border-red-200';
  if (rating <= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-green-600 bg-green-50 border-green-200';
};

const getUrgency = ({ session_rating, has_comment }) => {
  if (session_rating != null && session_rating <= 2) {
    return { label: 'URGENT', colour: 'bg-red-600 text-white', priority: 3 };
  }
  if (session_rating != null && session_rating <= 3 && has_comment) {
    return { label: 'ATTENTION', colour: 'bg-yellow-500 text-white', priority: 2 };
  }
  return { label: 'INFO', colour: 'bg-blue-500 text-white', priority: 1 };
};

const KioskFeedbackList = ({ feedbackList, selectedFeedback, onFeedbackClick }) => {
  // Accepts raw rows (many per session) and reduces to one card per session.
  const sessions = React.useMemo(() => groupBySession(feedbackList || []), [feedbackList]);

  // Sort newest first
  const sorted = React.useMemo(
    () =>
      [...sessions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [sessions]
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {sorted.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No pending feedback at the moment</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Active Alerts</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {sorted.length} alert{sorted.length !== 1 ? 's' : ''}
            </span>
          </div>

          {sorted.map((s) => {
            const urgency = getUrgency(s);

            return (
              <div
                key={s.session_id}
                onClick={() => onFeedbackClick?.(s)}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedFeedback?.session_id === s.session_id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Header / urgency */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">
                      Table {s.table_number}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${urgency.colour}`}>
                      {urgency.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {s.created_at ? dayjs(s.created_at).fromNow() : ''}
                  </span>
                </div>

                {/* Overall rating */}
                {s.session_rating != null && (
                  <div
                    className={`inline-block px-2 py-1 rounded border text-sm font-medium mb-2 ${getRatingColour(
                      s.session_rating
                    )}`}
                  >
                    Rating: {s.session_rating.toFixed(1)}/5
                  </div>
                )}

                {/* Optional single question preview */}
                {s.question_preview && (
                  <p className="text-sm font-medium text-gray-700 mb-1">{s.question_preview}</p>
                )}

                {/* Optional feedback preview */}
                {s.additional_feedback && (
                  <p className="text-sm text-gray-600 italic">"{s.additional_feedback}"</p>
                )}

                {/* Multiple items indicator */}
                {s.items_count > 1 && (
                  <div className="mt-2 text-xs text-gray-500">
                    +{s.items_count - 1} more item{s.items_count > 2 ? 's' : ''} in this session
                  </div>
                )}

                {/* Visual priority bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                    urgency.priority === 3 ? 'bg-red-600' : urgency.priority === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KioskFeedbackList;