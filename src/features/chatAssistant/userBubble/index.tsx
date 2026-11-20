interface UserBubbleProps {
  text: string;
  time?: string;
}

/** The user's side of the conversation: a question or an answer to a card */
export function UserBubble({ text, time }: UserBubbleProps) {
  return (
    <div className="max-w-full self-end rounded-xl rounded-ee-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground md:max-w-2xl">
      <p className="whitespace-pre-wrap break-words">{text}</p>
      {time != null && time !== '' && <p className="mt-1 text-end text-xs opacity-80">{time}</p>}
    </div>
  );
}
