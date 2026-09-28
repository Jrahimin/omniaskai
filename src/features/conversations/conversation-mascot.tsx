export function ConversationMascot() {
  return (
    <span className="workspace-answer-mascot" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" className="size-full">
        <path
          className="workspace-mascot-body"
          d="M24 5.5c10.6 0 18.5 7.8 18.5 18.2 0 10.1-7.5 18.1-18.5 18.1-3.2 0-6.2-.7-8.7-2.1L6 42l2.6-8.3C6.6 30.9 5.5 27.5 5.5 23.7 5.5 13.3 13.4 5.5 24 5.5Z"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M12.8 17.7c2.4-5.1 6.3-7.7 11.1-7.7" stroke="white" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
        <ellipse className="workspace-mascot-eye" cx="18.5" cy="23.2" rx="2" ry="2.6" fill="#123c38" />
        <ellipse className="workspace-mascot-eye" cx="29.5" cy="23.2" rx="2" ry="2.6" fill="#123c38" />
        <path d="M19 31c2.9 2.6 7.1 2.6 10 0" stroke="#123c38" strokeWidth="2" strokeLinecap="round" />
        <circle cx="35.5" cy="16" r="2" fill="white" fillOpacity=".75" />
      </svg>
    </span>
  );
}
