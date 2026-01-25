export type FlashMessageType = "success" | "error" | "info" | "warning";

export interface FlashMessageProps {
  message: string;
  type: FlashMessageType;
  duration: number;
  onClose?: () => void;
}
