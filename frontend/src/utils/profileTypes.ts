export type TabType = "info" | "payments" | "history";

export interface DeleteModalState {
  isOpen: boolean;
  presentationId: number | null;
  presentationTitle: string;
}
