// Wishlight — window.Wishlight
type IconName = 'star' | 'mic' | 'send' | 'play' | 'check' | 'trash' | 'chevron' | 'wave';
/** Same tags as backend/prompts/persona.md and VRM expression presets. */
type Emotion = 'neutral' | 'happy' | 'relaxed' | 'sad' | 'surprised' | 'angry';
type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Icon in the round slot; null hides the slot. Default 'star'. */
  icon?: IconName | null;
}
export declare function Button(p: ButtonProps): JSX.Element;

export interface MicButtonProps { state?: VoiceState; onClick?: () => void; showLabel?: boolean; label?: string; }
export declare function MicButton(p: MicButtonProps): JSX.Element;

export interface EmotionTagProps { emotion?: Emotion; onNight?: boolean; children?: React.ReactNode; }
export declare function EmotionTag(p: EmotionTagProps): JSX.Element;

export interface DialogueBoxProps {
  speaker: string; text: React.ReactNode; done?: boolean; emotion?: Emotion; subtitle?: string;
  auto?: boolean; onToggleAuto?: () => void; onLog?: () => void; onSkip?: () => void; onNext?: () => void;
}
export declare function DialogueBox(p: DialogueBoxProps): JSX.Element;

export interface ChatBubbleProps {
  from?: 'ai' | 'user'; name?: string; time?: string; emotion?: Emotion;
  /** Voice clip duration, e.g. "0:06"; shows a replay button. */
  voice?: string; onPlay?: () => void; typing?: boolean; children?: React.ReactNode;
}
export declare function ChatBubble(p: ChatBubbleProps): JSX.Element;

export interface ChatComposerProps {
  value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; onSend?: () => void;
  micState?: VoiceState; onMic?: () => void; placeholder?: string;
}
export declare function ChatComposer(p: ChatComposerProps): JSX.Element;

export interface ConversationItemProps { title: string; snippet?: string; time?: string; current?: boolean; onClick?: () => void; }
export declare function ConversationItem(p: ConversationItemProps): JSX.Element;

export interface ToggleProps { checked?: boolean; onChange?: (next: boolean) => void; label: React.ReactNode; }
export declare function Toggle(p: ToggleProps): JSX.Element;

export declare function Icon(p: { name: IconName; className?: string }): JSX.Element;
